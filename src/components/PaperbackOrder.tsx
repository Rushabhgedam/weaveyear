import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { CalendarCustomizations } from '../services/calendarGenerator';
import './PaperbackOrder.css';

interface PaperbackOrderProps {
  customizations: CalendarCustomizations;
}

interface OrderFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const PaperbackOrder: React.FC<PaperbackOrderProps> = ({ customizations }) => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.postalCode) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // Save order to Firestore
      await addDoc(collection(db, 'paperbackOrders'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || formData.email,
        ...formData,
        customizations,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting order:', err);
      setError(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="order-success">
        <div className="success-icon">✓</div>
        <h3>Order Submitted Successfully!</h3>
        <p>Your paperback calendar order has been received. We'll process it and contact you soon.</p>
        <p className="order-id">Order ID: {Date.now()}</p>
      </div>
    );
  }

  return (
    <form className="paperback-order-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="address">Street Address *</label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="state">State/Province</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="postalCode">Postal Code *</label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="country">Country *</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button type="submit" className="submit-order-btn" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Order'}
      </button>

      <p className="order-note">
        * Required fields. Your order will be processed and you'll receive a confirmation email.
      </p>
    </form>
  );
};

export default PaperbackOrder;

