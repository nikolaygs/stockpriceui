import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";

export default function ResultPanel({ setShow, show, variant, message }) {
  function getHeader(variant) {
    switch (variant) {
      case "success":
        return "Server successfully processed your request";
      case "info":
        return "No data was found";
      default:
        return "Fatal error";
    }
  }

  return (
    <Alert show={show} variant={variant}>
      <Alert.Heading>{getHeader(variant)}</Alert.Heading>
      <p>{message}</p>
      <hr />
      <div className="d-flex justify-content-end">
        <Button onClick={() => setShow(false)} variant={variant}>
          Close me
        </Button>
      </div>
    </Alert>
  );
}