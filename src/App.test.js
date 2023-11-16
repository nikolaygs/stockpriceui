import React from "react";
import MaxProfitForm from "./App";
import { rest } from 'msw';
// import { setupServer } from 'msw/node'
// import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'

beforeEach(() => render(<MaxProfitForm />))
// TODO afterEach

// const server = setupServer(
//   rest.get('/maxprofit', (req, res, ctx) => {
//     console.log("Server accessed")
//     return res(ctx.json({greeting: 'hello there'}))
//   }),
// )

test('Invalid stock symbol field', async () => {
  const field = screen.getByTestId('symbol-field')
  fireEvent.change(field, { target: { value: '' } })

  expect(field.value).toBe('')
  expect(field).toBeInvalid()
})

test('Valid stock symbol field', async () => {
  const field = screen.getByTestId('symbol-field')
  fireEvent.change(field, { target: { value: 'UBER' } })

  expect(field.value).toBe('UBER')
  expect(field).toBeValid()
})

test('Invalid amount field - more decimals', async () => {
  const field = screen.getByTestId('amount-field')
  fireEvent.change(field, { target: { value: 100.1323 } })

  expect(field.value).toBe("100.1323")
  expect(field).toBeInvalid()
})

test('Invalid amount field - not a number', async () => {
  const field = screen.getByTestId('amount-field')
  fireEvent.change(field, { target: { value: "test" } })

  expect(field.value).toBe("")
  expect(field).toBeInvalid()
})

test('Valid amount field', async () => {
  const field = screen.getByTestId('amount-field')
  fireEvent.change(field, { target: { value: 100.13 } })

  expect(field.value).toBe("100.13")
  expect(field).toBeValid()
})

test('Invalid date field', async () => {
  const field = screen.getByTestId('begin')
  fireEvent.change(field, { target: { value: "100.13" } })

  expect(field.value).toBe("")
  expect(field).toBeInvalid()
})

test('Valid date field', async () => {
  const field = screen.getByTestId('begin')
  fireEvent.change(field, { target: { value: "2023-11-16T10:30" } })

  expect(field.value).toBe("2023-11-16T10:30")
  expect(field).toBeValid()
})

test('Form is not valid', async () => {
  const field = screen.getByTestId('form')

  expect(field).toBeInvalid()
})

test('Form is valid', async () => {
  const field = screen.getByTestId('form')

  fireEvent.change(screen.getByTestId('symbol-field'), { target: { value: 'UBER' } })
  fireEvent.change(screen.getByTestId('begin'), { target: { value: "2023-11-16T10:30" } })
  fireEvent.change(screen.getByTestId('end'), { target: { value: "2023-12-16T10:30" } })
  fireEvent.change(screen.getByTestId('amount-field'), { target: { value: 100 } })

  expect(field).toBeValid()
})

test('Form submit', async () => {
  const field = screen.getByTestId('form')

  fireEvent.change(screen.getByTestId('symbol-field'), { target: { value: 'UBER' } })
  fireEvent.change(screen.getByTestId('begin'), { target: { value: "2023-11-16T10:30" } })
  fireEvent.change(screen.getByTestId('end'), { target: { value: "2023-12-16T10:30" } })
  fireEvent.change(screen.getByTestId('amount-field'), { target: { value: 100 } })

  fireEvent.click(screen.getByText('Submit'))

  expect(field).toBeValid()
})
