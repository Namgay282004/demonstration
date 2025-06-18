import React, { useState, useEffect } from 'react';

const BMICalculator = () => {
  const BASE_URL = 'https://bmi-backend-dev-2.onrender.com';
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [bmi, setBmi] = useState(null);
  const [message, setMessage] = useState('');
  const [bmiHistory, setBmiHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('calculator');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchBMIHistory();
    }
  }, [activeTab]);

  const fetchBMIHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/user/bmi`);
      if (res.ok) {
        const data = await res.json();
        setBmiHistory(data);
      } else {
        setMessage('Failed to load history');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getBMICategory = (bmiValue) => {
    if (bmiValue < 18.5) return { category: 'Underweight', color: '#3b82f6', bg: '#dbeafe' };
    if (bmiValue < 25) return { category: 'Normal', color: '#10b981', bg: '#d1fae5' };
    if (bmiValue < 30) return { category: 'Overweight', color: '#f59e0b', bg: '#fef3c7' };
    return { category: 'Obese', color: '#ef4444', bg: '#fee2e2' };
  };

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    
    if (!h || !w || h <= 0 || w <= 0) {
      setMessage('Please enter valid height and weight');
      return;
    }
    
    const bmiValue = +(w / (h * h)).toFixed(1);
    setBmi(bmiValue);
    setMessage('');
  };

const saveBMI = async () => {
  if (!bmi) {
    setMessage('Calculate BMI first');
    return;
  }

  setLoading(true);
  try {
    const res = await fetch(`${BASE_URL}/api/create/bmi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        height: parseFloat(height),
        weight: parseFloat(weight),
        age: age ? parseInt(age) : null
      })
    });

    if (res.ok) {
      const successMsg = 'BMI saved successfully!';
      setMessage(successMsg);
      clearForm();
      if (activeTab === 'history') fetchBMIHistory();
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setMessage(prev => prev === successMsg ? '' : prev);
      }, 3000);
    } else {
      setMessage('Failed to save BMI');
    }
  } catch (err) {
    setMessage('Error saving BMI. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const deleteBMI = async (id) => {
    if (!confirm('Delete this record?')) return;
    
    try {
      const res = await fetch(`${BASE_URL}/api/user/bmi/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBMIHistory();
        setMessage('Record deleted');
      } else {
        setMessage('Failed to delete record');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    }
  };

  const clearForm = () => {
    setHeight('');
    setWeight('');
    setAge('');
    setBmi(null);
    setMessage('');
  };

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const cardStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px'
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 8px 0'
  };

  const subtitleStyle = {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0'
  };

  const tabContainerStyle = {
    display: 'flex',
    marginBottom: '30px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    padding: '4px'
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '12px 24px',
    border: 'none',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? '#ffffff' : '#6b7280',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  const inputContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  };

  const inputStyle = {
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '12px',
    marginBottom: '30px',
    flexWrap: 'wrap'
  };

  const buttonStyle = (variant = 'primary') => {
    const variants = {
      primary: { backgroundColor: '#3b82f6', color: '#ffffff' },
      success: { backgroundColor: '#10b981', color: '#ffffff' },
      secondary: { backgroundColor: '#6b7280', color: '#ffffff' },
      outline: { backgroundColor: 'transparent', color: '#6b7280', border: '2px solid #e5e7eb' }
    };

    return {
      flex: 1,
      minWidth: '120px',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ...variants[variant]
    };
  };

  const resultStyle = {
    textAlign: 'center',
    padding: '30px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    marginBottom: '20px'
  };

  const bmiValueStyle = {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '15px'
  };

  const categoryBadgeStyle = (color) => ({
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: color,
    color: '#ffffff',
    borderRadius: '20px',
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '20px'
  });

  const scaleContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '8px',
    marginTop: '20px'
  };

  const scaleItemStyle = (bgColor, textColor) => ({
    padding: '12px 8px',
    backgroundColor: bgColor,
    color: textColor,
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '12px'
  });

  const messageStyle = (isSuccess) => ({
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
    marginTop: '20px',
    backgroundColor: isSuccess ? '#d1fae5' : '#fee2e2',
    color: isSuccess ? '#065f46' : '#991b1b',
    border: `1px solid ${isSuccess ? '#a7f3d0' : '#fecaca'}`
  });

  const historyItemStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    transition: 'box-shadow 0.2s ease'
  };

  const historyHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ padding: '40px' }}>
          {/* Header */}
          <div style={headerStyle}>
            <h1 style={titleStyle}>BMI Calculator</h1>
            <p style={subtitleStyle}>Track your Body Mass Index</p>
          </div>

          {/* Tabs */}
          <div style={tabContainerStyle}>
            <button
              onClick={() => setActiveTab('calculator')}
              style={tabStyle(activeTab === 'calculator')}
            >
              Calculator
            </button>
            <button
              onClick={() => setActiveTab('history')}
              style={tabStyle(activeTab === 'history')}
            >
              History
            </button>
          </div>

          {/* Calculator Tab */}
          {activeTab === 'calculator' && (
            <div>
              <div style={inputContainerStyle}>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Height (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    style={inputStyle}
                    placeholder="1.8"
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    style={inputStyle}
                    placeholder="70"
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Age (optional)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={inputStyle}
                    placeholder="25"
                  />
                </div>
              </div>

              <div style={buttonContainerStyle}>
                <button
                  onClick={calculateBMI}
                  style={buttonStyle('primary')}
                >
                  Calculate
                </button>
                <button
                  onClick={saveBMI}
                  disabled={!bmi || loading}
                  style={{
                    ...buttonStyle('success'),
                    opacity: (!bmi || loading) ? 0.5 : 1,
                    cursor: (!bmi || loading) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={clearForm}
                  style={buttonStyle('outline')}
                >
                  Clear
                </button>
              </div>

              {/* BMI Result */}
              {bmi && (
                <div style={resultStyle}>
                  <div style={bmiValueStyle}>{bmi}</div>
                  <div style={categoryBadgeStyle(getBMICategory(bmi).color)}>
                    {getBMICategory(bmi).category}
                  </div>
                  
                  {/* BMI Scale */}
                  <div style={scaleContainerStyle}>
                    <div style={scaleItemStyle('#dbeafe', '#1e40af')}>
                      <div style={{ fontWeight: 'bold' }}>Underweight</div>
                      <div>&lt; 18.5</div>
                    </div>
                    <div style={scaleItemStyle('#d1fae5', '#065f46')}>
                      <div style={{ fontWeight: 'bold' }}>Normal</div>
                      <div>18.5 - 24.9</div>
                    </div>
                    <div style={scaleItemStyle('#fef3c7', '#92400e')}>
                      <div style={{ fontWeight: 'bold' }}>Overweight</div>
                      <div>25 - 29.9</div>
                    </div>
                    <div style={scaleItemStyle('#fee2e2', '#991b1b')}>
                      <div style={{ fontWeight: 'bold' }}>Obese</div>
                      <div>≥ 30</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              {message && (
                <div style={messageStyle(message.includes('success'))}>
                  {message}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div>
              <div style={historyHeaderStyle}>
                <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  BMI History
                </h3>
                <button
                  onClick={fetchBMIHistory}
                  disabled={loading}
                  style={{
                    ...buttonStyle('primary'),
                    flex: 'none',
                    minWidth: 'auto',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading...</div>
              ) : bmiHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px' }}>
                  <div style={{ color: '#6b7280', marginBottom: '20px', fontSize: '18px' }}>No records found</div>
                  <button
                    onClick={() => setActiveTab('calculator')}
                    style={buttonStyle('primary')}
                  >
                    Calculate BMI
                  </button>
                </div>
              ) : (
                <div>
                  {bmiHistory.map((record) => {
                    const category = getBMICategory(record.bmi);
                    return (
                      <div 
                        key={record.id} 
                        style={historyItemStyle}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>
                                {record.bmi}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                padding: '4px 8px',
                                backgroundColor: category.color,
                                color: '#ffffff',
                                borderRadius: '12px',
                                fontWeight: '500'
                              }}>
                                {category.category}
                              </div>
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                              <div><span style={{ fontWeight: '500' }}>Height:</span> {record.height}m</div>
                              <div><span style={{ fontWeight: '500' }}>Weight:</span> {record.weight}kg</div>
                              {record.age && <div><span style={{ fontWeight: '500' }}>Age:</span> {record.age}</div>}
                              <div><span style={{ fontWeight: '500' }}>Date:</span> {new Date(record.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteBMI(record.id)}
                            style={{
                              padding: '8px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {message && (
                <div style={messageStyle(message.includes('success') || message.includes('deleted'))}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;
