import React, { useState, useEffect } from 'react'

const BMICalculator = () => {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [bmi, setBmi] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [bmiHistory, setBmiHistory] = useState([])
  const [activeTab, setActiveTab] = useState('calculator')
  const [loading, setLoading] = useState(false)

  // Fetch BMI history when component mounts or when switching to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      fetchBMIHistory()
    }
  }, [activeTab])

  const fetchBMIHistory = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/user/bmi', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error('Failed to fetch BMI history.')
      }

      const data = await res.json()
      setBmiHistory(data)
      setMessage('BMI history loaded successfully!')
    } catch (err: any) {
      setMessage(err.message || 'Failed to load BMI history.')
      setBmiHistory([])
    } finally {
      setLoading(false)
    }
  }

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5) return { category: 'Underweight', color: '#3b82f6' }
    if (bmiValue < 25) return { category: 'Normal weight', color: '#10b981' }
    if (bmiValue < 30) return { category: 'Overweight', color: '#f59e0b' }
    return { category: 'Obese', color: '#ef4444' }
  }

  const getBMIAdvice = (bmiValue: number) => {
    if (bmiValue < 18.5) return 'Consider consulting a healthcare provider about healthy weight gain strategies.'
    if (bmiValue < 25) return 'Great! You are in the healthy weight range. Maintain your current lifestyle.'
    if (bmiValue < 30) return 'Consider adopting healthier eating habits and increasing physical activity.'
    return 'Please consult with a healthcare provider about weight management strategies.'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const heightNum = parseFloat(height)
    const weightNum = parseFloat(weight)
    const ageNum = parseInt(age)

    if (!heightNum || !weightNum || !ageNum) {
      setMessage('Please enter valid numbers for all fields.')
      setLoading(false)
      return
    }

    if (heightNum <= 0 || weightNum <= 0 || ageNum <= 0) {
      setMessage('Please enter positive values for all fields.')
      setLoading(false)
      return
    }

    if (heightNum < 0.5 || heightNum > 3) {
      setMessage('Please enter a realistic height between 0.5m and 3m.')
      setLoading(false)
      return
    }

    if (weightNum < 10 || weightNum > 500) {
      setMessage('Please enter a realistic weight between 10kg and 500kg.')
      setLoading(false)
      return
    }

    if (ageNum < 1 || ageNum > 120) {
      setMessage('Please enter a realistic age between 1 and 120 years.')
      setLoading(false)
      return
    }

    const bmiVal = +(weightNum / (heightNum * heightNum)).toFixed(2)
    setBmi(bmiVal)

    try {
      const res = await fetch('/api/create/bmi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        id: Math.floor(Math.random() * 1000000),
        height: heightNum,
        weight: weightNum,
        age: ageNum,
        bmi: bmiVal,
        createdAt: new Date().toISOString()
      }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to save BMI data.')
      }

      setMessage('BMI calculated and saved successfully!')
      
      // Clear form after successful save
      setHeight('')
      setWeight('')
      setAge('')
      
      // Refresh history if on history tab
      if (activeTab === 'history') {
        fetchBMIHistory()
      }
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong while saving.')
    } finally {
      setLoading(false)
    }
  }

  const handleCalculateOnly = () => {
    setMessage('')
    const heightNum = parseFloat(height)
    const weightNum = parseFloat(weight)

    if (!heightNum || !weightNum) {
      setMessage('Please enter valid height and weight.')
      return
    }

    if (heightNum <= 0 || weightNum <= 0) {
      setMessage('Please enter positive values.')
      return
    }

    if (heightNum < 0.5 || heightNum > 3) {
      setMessage('Please enter a realistic height between 0.5m and 3m.')
      return
    }

    if (weightNum < 10 || weightNum > 500) {
      setMessage('Please enter a realistic weight between 10kg and 500kg.')
      return
    }

    const bmiVal = +(weightNum / (heightNum * heightNum)).toFixed(2)
    setBmi(bmiVal)
    setMessage('BMI calculated successfully (not saved to database).')
  }

  const clearForm = () => {
    setHeight('')
    setWeight('')
    setAge('')
    setBmi(null)
    setMessage('')
  }

  const deleteBMIRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this BMI record?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/user/bmi/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        throw new Error('Failed to delete BMI record.')
      }

      setMessage('BMI record deleted successfully!')
      fetchBMIHistory() // Refresh the list
    } catch (err: any) {
      setMessage(err.message || 'Failed to delete record.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '10px' }}>BMI Calculator & Tracker</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
        Track your Body Mass Index over time and maintain a healthy lifestyle
      </p>
      
      {/* Tab Navigation */}
      <div style={{ marginBottom: '30px', borderBottom: '2px solid #e5e5e5' }}>
        <button
          onClick={() => setActiveTab('calculator')}
          style={{
            padding: '12px 24px',
            marginRight: '10px',
            border: 'none',
            backgroundColor: activeTab === 'calculator' ? '#3b82f6' : 'transparent',
            color: activeTab === 'calculator' ? 'white' : '#666',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          📊 Calculator
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 24px',
            border: 'none',
            backgroundColor: activeTab === 'history' ? '#3b82f6' : 'transparent',
            color: activeTab === 'history' ? 'white' : '#666',
            cursor: 'pointer',
            borderRadius: '8px 8px 0 0',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
        >
          📈 BMI History
        </button>
      </div>

      {/* Calculator Tab */}
      {activeTab === 'calculator' && (
        <div>
          <div style={{ backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Enter Your Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                  📏 Height (meters):
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.5"
                  max="3"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #ddd', 
                    borderRadius: '8px', 
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="e.g., 1.75"
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                  ⚖️ Weight (kg):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="10"
                  max="500"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #ddd', 
                    borderRadius: '8px', 
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="e.g., 70.5"
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                  🎂 Age (years):
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: '2px solid #ddd', 
                    borderRadius: '8px', 
                    fontSize: '16px',
                    transition: 'border-color 0.2s'
                  }}
                  placeholder="e.g., 25"
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleCalculateOnly}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#059669')}
                onMouseOut={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#10b981')}
              >
                🧮 Calculate Only
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleSubmit(e)
                }}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#2563eb')}
                onMouseOut={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6')}
              >
                {loading ? '⏳ Saving...' : '💾 Calculate & Save BMI'}
              </button>

              <button
                type="button"
                onClick={clearForm}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#4b5563')}
                onMouseOut={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#6b7280')}
              >
                🗑️ Clear Form
              </button>
            </div>
          </div>

          {/* BMI Result Display */}
          {bmi !== null && (
            <div style={{ 
              backgroundColor: 'white', 
              padding: '25px', 
              borderRadius: '12px', 
              border: '2px solid #e5e5e5',
              textAlign: 'center',
              marginBottom: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#333' }}>🎯 Your BMI Result</h3>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '15px' }}>
                BMI: <span style={{ color: getBMICategory(bmi).color }}>{bmi}</span>
              </div>
              <div style={{ 
                fontSize: '20px', 
                color: getBMICategory(bmi).color,
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                Category: {getBMICategory(bmi).category}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#666',
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '15px'
              }}>
                💡 <strong>Advice:</strong> {getBMIAdvice(bmi)}
              </div>
              
              {/* BMI Scale */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '10px', color: '#333' }}>BMI Scale Reference</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '6px', fontSize: '12px' }}>
                    Underweight: &lt;18.5
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#10b981', color: 'white', borderRadius: '6px', fontSize: '12px' }}>
                    Normal: 18.5-24.9
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#f59e0b', color: 'white', borderRadius: '6px', fontSize: '12px' }}>
                    Overweight: 25-29.9
                  </div>
                  <div style={{ padding: '8px 12px', backgroundColor: '#ef4444', color: 'white', borderRadius: '6px', fontSize: '12px' }}>
                    Obese: ≥30
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: message.includes('success') || message.includes('calculated') ? '#d1fae5' : '#fee2e2',
              color: message.includes('success') || message.includes('calculated') ? '#065f46' : '#dc2626',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {message.includes('success') || message.includes('calculated') ? '✅ ' : '❌ '}
              {message}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, color: '#333' }}>📈 Your BMI History</h3>
            <button
              onClick={fetchBMIHistory}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#2563eb')}
              onMouseOut={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6')}
            >
              {loading ? '⏳ Loading...' : '🔄 Refresh Data'}
            </button>
          </div>

          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px', 
              color: '#666',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Loading BMI history...</div>
            </div>
          ) : bmiHistory.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '12px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>No BMI records found</div>
              <div style={{ fontSize: '16px' }}>Calculate and save your first BMI to start tracking your progress!</div>
              <button
                onClick={() => setActiveTab('calculator')}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                Go to Calculator
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e0f2fe', borderRadius: '8px', textAlign: 'center' }}>
                <strong>📊 Total Records: {bmiHistory.length}</strong>
              </div>
              
              <div style={{ display: 'grid', gap: '20px' }}>
                {bmiHistory.map((record: any, index: number) => {
                  const category = getBMICategory(record.bmi)
                  return (
                    <div
                      key={record.id || index}
                      style={{
                        backgroundColor: 'white',
                        padding: '25px',
                        borderRadius: '12px',
                        border: '2px solid #e5e5e5',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 'bold' }}>📊 BMI</div>
                          <div style={{ fontSize: '24px', fontWeight: 'bold', color: category.color }}>
                            {record.bmi}
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 'bold' }}>🏷️ Category</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: category.color }}>
                            {category.category}
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 'bold' }}>📏 Height</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{record.height}m</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 'bold' }}>⚖️ Weight</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{record.weight}kg</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 'bold' }}>🎂 Age</div>
                          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{record.age}</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 'bold' }}>📅 Date</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                            {record.createdAt ? new Date(record.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </div>
                        </div>

                        {record.id && (
                          <div style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => deleteBMIRecord(record.id)}
                              disabled={loading}
                              style={{
                                padding: '8px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                opacity: loading ? 0.6 : 1,
                                transition: 'all 0.2s'
                              }}
                            onMouseOver={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#dc2626')}
                            onMouseOut={(e) => !loading && ((e.target as HTMLButtonElement).style.backgroundColor = '#ef4444')}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* BMI Advice for each record */}
                      <div style={{ 
                        marginTop: '15px', 
                        padding: '12px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#666',
                        borderLeft: `4px solid ${category.color}`
                      }}>
                        💡 <strong>Health Status:</strong> {getBMIAdvice(record.bmi)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Message Display for History Tab */}
          {message && (
            <div style={{ 
              padding: '15px', 
              backgroundColor: message.includes('success') || message.includes('loaded') ? '#d1fae5' : '#fee2e2',
              color: message.includes('success') || message.includes('loaded') ? '#065f46' : '#dc2626',
              borderRadius: '8px',
              marginTop: '20px',
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {message.includes('success') || message.includes('loaded') ? '✅ ' : '❌ '}
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  )
};

export default BMICalculator;