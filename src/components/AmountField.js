import Form from "react-bootstrap/Form";

export default function AmountField({ onChange }) {
  return (
    <Form.Group className="mb-3" controlId="amount">
      <Form.Label>Amount</Form.Label>
      <Form.Control
        data-testid="amount-field"
        required
        type="number"
        min={1}
        step="0.01"
        onChange={onChange}
      />
      <Form.Control.Feedback type="invalid" data-testid="feedback">
        Amount must be a possitive number with max 2 decimals
      </Form.Control.Feedback>
    </Form.Group>
  );
}
