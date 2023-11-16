import Form from "react-bootstrap/Form";

export default function StockSymbolField({ onChange }) {
  return (
    <Form.Group className="mb-3" controlId="stock">
      <Form.Label>Stock</Form.Label>
      <Form.Control  data-testid="symbol-field" required type="text" onChange={onChange} />
      <Form.Control.Feedback  data-testid="symbol-feedback" type="invalid">
        The field is required
      </Form.Control.Feedback>
    </Form.Group>
  );
}