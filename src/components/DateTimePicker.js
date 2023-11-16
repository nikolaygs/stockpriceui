import Form from "react-bootstrap/Form";

export default function DateTimePicker({ id, title, onChange }) {
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{title}</Form.Label>
      <Form.Control data-testid={id} type="datetime-local" onChange={onChange} required />
    </Form.Group>
  );
}