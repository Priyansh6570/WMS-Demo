'use client'

import { useState, useEffect } from 'react'
import { dataManager } from '@/lib/data-manager'
import { validateMobile } from '@/lib/utils'
import { ROLES } from '@/lib/constants'
import Button from '../ui/Button'
import Input from '../ui/Form/Input'

const getAssignableRoles = (currentUser) => {
  const allRoles = Object.entries(ROLES).map(([key, { label }]) => ({ value: key, label }));

  if (currentUser.role === 'super_admin') {
    return allRoles;
  }
  if (currentUser.role === 'admin') {
    return allRoles.filter(r => ['contractor', 'quality_manager', 'financial_officer'].includes(r.value));
  }
  if (currentUser.role === 'contractor') {
    return allRoles.filter(r => r.value === 'worker');
  }
  return [];
};


export default function UserForm({ user, currentUser, onClose, onSave }) {
  const isEditing = !!user;
  const assignableRoles = getAssignableRoles(currentUser);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    role: user?.role || assignableRoles[0]?.value || '',
  });
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEditRole = () => {
    if (!isEditing) return true;
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'admin') {
      const editableRoles = ['contractor', 'quality_manager', 'financial_officer'];
      return editableRoles.includes(user.role);
    }
    return false;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.mobile || !formData.role) {
      setError('All fields are required.');
      return;
    }
    if (!validateMobile(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await dataManager.updateUser(user.id, {
          name: formData.name,
          mobile: formData.mobile,
          role: formData.role,
        });
        onSave();
        onClose();
      } else {
        const newUserPayload = {
          name: formData.name,
          mobile: formData.mobile,
          role: formData.role,
          createdBy: currentUser.id,
        };
        const addedUser = await dataManager.addUser(newUserPayload);
        const link = `${window.location.origin}/WMS/login?mobile=${addedUser.mobile}`;
        setGeneratedLink(link);
        onSave();
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-gray-700 modal-overlay">
      <div className="modal-content">
        <h2 className="mb-4 card-title">{isEditing ? 'Edit User' : 'Add New User'}</h2>
        
        {!generatedLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required maxLength={10} />
            
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                name="role"
                className="input"
                value={formData.role}
                onChange={handleChange}
                disabled={!canEditRole()}
              >
                {canEditRole() ? assignableRoles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                )) : <option value={formData.role}>{ROLES[formData.role]?.label}</option>}
              </select>
            </div>

            {error && <p className="form-error">{error}</p>}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
                {isEditing ? 'Save Changes' : 'Create User'}
              </Button>
            </div>
          </form>
        ) : (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold text-green-700'>User Created Successfully!</h3>
            <p>Share this link with the new user to log in:</p>
            <div className='p-2 bg-gray-100 border rounded'>
              <a href={generatedLink} target="_blank" rel="noopener noreferrer" className="break-all text-primary-600">{generatedLink}</a>
            </div>
             <div className="flex justify-end pt-4">
              <Button type="button" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}