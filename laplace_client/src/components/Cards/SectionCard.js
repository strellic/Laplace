import React from "react";

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText
} from "reactstrap";

import { Link } from "react-router-dom";

class SectionCard extends React.Component {
  render() {
    const { title, desc, onClick = () => {}, onDelete = null, to, button = "Edit" } = this.props;
    return (
      <Card className="room-card mr-3">
        <CardBody>
          <CardTitle tag="h4">{title}</CardTitle>
          <CardText>
            {desc}
          </CardText>
          
          { to ? (
            <Button
              color="info"
              onClick={e => {onClick(title)} }
              tag={Link}
              to={to}
            >
              {button}
            </Button>
          ) : (
            <Button
              color="info"
              onClick={e => {onClick(title)} }
            >
              {button}
            </Button>
          )}
          
          {onDelete && (<Button
            color="danger"
            onClick={e => {onDelete(title)} }
          >
            Delete
          </Button>)}
        </CardBody>
      </Card>
    )
  }
}

export default SectionCard;