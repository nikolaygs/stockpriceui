import { useState } from "react";
import Alert from "react-bootstrap/Alert";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import parse from "html-react-parser";
import configData from "./config.json";

export default function MaxProfitForm() {
  // form validation status
  const [validated, setValidated] = useState(false);

  // field values
  const [beginPoint, setBeginPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [amount, setAmount] = useState(0.0);
  const [stock, setStock] = useState("");

  // result panel status fields
  const [showResultPanel, setShowResultPanel] = useState(false);
  const [variantResultPanel, setVariantResultPanel] = useState("");
  const [messageResultPanel, setMessageResultPanel] = useState("");

  // updates state upon change in any of the form fields
  function onFieldChange(event) {
    switch (event.target.id) {
      case "begin":
        setBeginPoint(event.target.value);
        break;
      case "end":
        setEndPoint(event.target.value);
        break;
      case "amount":
        setAmount(event.target.value);
        break;
      case "stock":
        setStock(event.target.value);
        break;
      default:
        console.error("Unrecognized event.target id", id);
    }
  }

  // Handling of the submit form. It does two things:
  // 1. Performs client-side validation
  // 2. Fires server request if validation passes
  function handleSubmit(event) {
    const form = event.currentTarget;
    if (form.checkValidity() === true) {
      getMaxProfit();
    }

    event.preventDefault();
    event.stopPropagation();
    setValidated(true);
  }

  // Builds URL and calls the server using fetch API
  function getMaxProfit() {
    // convert to seconds
    let beginSeconds = Date.parse(beginPoint) / 1000;
    let endSeconds = Date.parse(endPoint) / 1000;

    fetch(
      `http://localhost:${configData.SERVER_PORT}/maxprofit?symbol=${stock}&begin=${beginSeconds}&end=${endSeconds}`
    )
      .then((r) => r.json().then((data) => ({ status: r.status, body: data })))
      .then((data) => processResult(data))
      .catch((error) => onError(error));
  }

  // Updates the status of the result panel based on the response receiced from the server.
  // Generally the panel supports 3 states
  // 1. Max Profit points were returned by the server and the panel displays "friendly" message to the user
  // 2. Server returned 4XX retuest - panel renders the cause so client can fix its request
  // 3. Any other error - generic message that server failed is displayed
  function processResult(data) {
    if (data.status == 200) {
      setResultPanelProps("success", profitMessage(data.body));
    } else if (data.status == 404 || data.status == 400) {
      setResultPanelProps("info", data.body.message);
    } else {
      setResultPanelProps("danger", "The server failed to return a response");
    }

    setShowResultPanel(true);
    return data;
  }

  // Displays error message if fetching fails unexpectedly
  function onError(error) {
    setResultPanelProps("danger", "The server failed to return a response");
    setShowResultPanel(true);
  }

  // Helper function that sets state fields of ResultRanel
  function setResultPanelProps(variant, message) {
    setVariantResultPanel(variant);
    setMessageResultPanel(message);
  }

  // profitMessage generates user-"friendly" message about the max possible profit
  function profitMessage(data) {
    const begin = beginPoint;
    const end = endPoint;
    const shares = amount / data.buyPoint.price;
    const maxProfit = (data.sellPoint.price - data.buyPoint.price) * shares;
    const lowestDate = data.buyPoint.date;
    const highestDate = data.sellPoint.date;

    return parse(`
    <b>${maxProfit.toFixed(
      2
    )}$</b> is the maximum profit that you could have earned in the period from <b>${begin}</b> to <b>${end}</b> by trading stock <b>${stock}</b>.
    <p>
    This could have been achieved if you have bought <b>${shares.toFixed(
      2
    )}</b> of shares on <b>${lowestDate}</b> and sold them on <b>${highestDate}</b>`);
  }

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <StockSymbolField onChange={onFieldChange} />
      <DatePicker title="Begin date" id="begin" onChange={onFieldChange} />
      <DatePicker title="End date" id="end" onChange={onFieldChange} />
      <AmountField onChange={onFieldChange} />

      <ResultPanel
        setShow={setShowResultPanel}
        show={showResultPanel}
        variant={variantResultPanel}
        message={messageResultPanel}
      />
      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
}

function StockSymbolField({ onChange }) {
  return (
    <Form.Group className="mb-3" controlId="stock">
      <Form.Label>Stock</Form.Label>
      <Form.Control required type="text" onChange={onChange} />
      <Form.Control.Feedback type="invalid">
        The field is required
      </Form.Control.Feedback>
    </Form.Group>
  );
}

function AmountField({ onChange }) {
  return (
    <Form.Group className="mb-3" controlId="amount">
      <Form.Label>Amount</Form.Label>
      <Form.Control
        required
        type="number"
        min={1}
        step="0.01"
        onChange={onChange}
      />
      <Form.Control.Feedback type="invalid">
        Amount must be a possitive number with max 2 decimals
      </Form.Control.Feedback>
    </Form.Group>
  );
}

function DatePicker({ id, title, onChange }) {
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label>{title}</Form.Label>
      <Form.Control type="datetime-local" onChange={onChange} required />
    </Form.Group>
  );
}

function ResultPanel({ setShow, show, variant, message }) {
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

