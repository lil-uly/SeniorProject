import React, { useState } from 'react';
import './BusinessRegistration.css';


const BusinessRegistration = () => {
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        physicalAddress: '',
        websiteAddress: '',
        email: '',
        firstName: '',
        lastName: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://127.0.0.1:5000/api/register-business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setFormData({
                    businessName: '',
                    businessType: '',
                    physicalAddress: '',
                    websiteAddress: '',
                    email: '',
                    firstName: '',
                    lastName: ''
                });
            } else {
                alert(data.error || 'Failed to register business');
            }
        } catch (error) {
            console.error('Error registering business:', error);
            alert('An error occurred while registering the business.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Business Name:</label>
                    <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Type of Business:</label>
                    <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select type</option>
                        <option value="retail">Retail</option>
                        <option value="service">Service</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label>Physical Address:</label>
                    <input
                        type="text"
                        name="physicalAddress"
                        value={formData.physicalAddress}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Web Address:</label>
                    <input
                        type="text"
                        name="websiteAddress"
                        value={formData.websiteAddress}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Business Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>First Name:</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Last Name:</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default BusinessRegistration;