import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BMICalculator from './App'
import '@testing-library/jest-dom'

beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url === '/api/user/bmi' && (!options || options.method === 'GET')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '1',
            height: 1.75,
            weight: 70,
            age: 25,
            bmi: 22.86,
            createdAt: new Date().toISOString()
          }
        ])
      })
    }
    if (url === '/api/create/bmi' && options && options.method === 'POST') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    }
    if (url && url.startsWith('/api/user/bmi/') && options && options.method === 'DELETE') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }
    return Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
  }) as any
  window.confirm = jest.fn(() => true)
})

afterEach(() => {
  jest.clearAllMocks()
})

test('renders calculator tab and input fields', () => {
  render(<BMICalculator />)
  expect(screen.getByText(/BMI Calculator & Tracker/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Height/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/Age/i)).toBeInTheDocument()
})

test('calculates BMI and shows result (Calculate Only)', () => {
  render(<BMICalculator />)
  fireEvent.change(screen.getByPlaceholderText(/e.g., 1.75/i), { target: { value: '1.75' } })
  fireEvent.change(screen.getByPlaceholderText(/e.g., 70.5/i), { target: { value: '70' } })
  fireEvent.change(screen.getByPlaceholderText(/e.g., 25/i), { target: { value: '25' } })
  fireEvent.click(screen.getByText(/🧮 Calculate Only/i))
  expect(screen.getByText(/BMI calculated successfully/i)).toBeInTheDocument()
  expect(screen.getByText(/Your BMI Result/i)).toBeInTheDocument()
  expect(screen.getByText(/BMI: 22.86/i)).toBeInTheDocument()
  expect(screen.getByText(/Category: Normal weight/i)).toBeInTheDocument()
})

test('shows error for invalid input', () => {
  render(<BMICalculator />)
  fireEvent.change(screen.getByPlaceholderText(/e.g., 1.75/i), { target: { value: '' } })
  fireEvent.change(screen.getByPlaceholderText(/e.g., 70.5/i), { target: { value: '' } })
  fireEvent.click(screen.getByText(/🧮 Calculate Only/i))
  expect(screen.getByText(/Please enter valid height and weight/i)).toBeInTheDocument()
})

test('shows error for out-of-range input', () => {
  render(<BMICalculator />)
  fireEvent.change(screen.getByPlaceholderText(/e.g., 1.75/i), { target: { value: '0.2' } })
  fireEvent.change(screen.getByPlaceholderText(/e.g., 70.5/i), { target: { value: '5' } })
  fireEvent.click(screen.getByText(/🧮 Calculate Only/i))
  expect(screen.getByText(/Please enter a realistic height between 0.5m and 3m/i)).toBeInTheDocument()
})

test('saves BMI and clears form', async () => {
  render(<BMICalculator />)
  fireEvent.change(screen.getByPlaceholderText(/e.g., 1.75/i), { target: { value: '1.75' } })
  fireEvent.change(screen.getByPlaceholderText(/e.g., 70.5/i), { target: { value: '70' } })
  fireEvent.change(screen.getByPlaceholderText(/e.g., 25/i), { target: { value: '25' } })
  fireEvent.click(screen.getByText(/💾 Calculate & Save BMI/i))
  await waitFor(() => {
    expect(screen.getByText(/BMI calculated and saved successfully/i)).toBeInTheDocument()
  })
  expect(screen.getByPlaceholderText(/e.g., 1.75/i)).toHaveValue('')
  expect(screen.getByPlaceholderText(/e.g., 70.5/i)).toHaveValue('')
  expect(screen.getByPlaceholderText(/e.g., 25/i)).toHaveValue('')
})

test('switches to history tab and loads BMI history', async () => {
  render(<BMICalculator />)
  fireEvent.click(screen.getByText(/BMI History/i))
  await waitFor(() => {
    expect(screen.getByText(/Your BMI History/i)).toBeInTheDocument()
    expect(screen.getByText(/Total Records: 1/i)).toBeInTheDocument()
    expect(screen.getByText(/22.86/)).toBeInTheDocument()
    expect(screen.getByText(/Normal weight/)).toBeInTheDocument()
  })
})

test('deletes a BMI record', async () => {
  render(<BMICalculator />)
  fireEvent.click(screen.getByText(/BMI History/i))
  await waitFor(() => expect(screen.getByText(/🗑️ Delete/i)).toBeInTheDocument())
  fireEvent.click(screen.getByText(/🗑️ Delete/i))
  await waitFor(() => expect(screen.getByText(/BMI record deleted successfully/i)).toBeInTheDocument())
})

test('clear form button resets fields', () => {
  render(<BMICalculator />)
  fireEvent.change(screen.getByPlaceholderText(/e.g., 1.75/i), { target: { value: '1.75' } })
  fireEvent.change(screen.getByPlaceholderText(/e.g., 70.5/i), { target: { value: '70' } })
  fireEvent.change(screen.getByPlaceholderText(/e.g., 25/i), { target: { value: '25' } })
  fireEvent.click(screen.getByText(/🗑️ Clear Form/i))
  expect(screen.getByPlaceholderText(/e.g., 1.75/i)).toHaveValue('')
  expect(screen.getByPlaceholderText(/e.g., 70.5/i)).toHaveValue('')
  expect(screen.getByPlaceholderText(/e.g., 25/i)).toHaveValue('')
})