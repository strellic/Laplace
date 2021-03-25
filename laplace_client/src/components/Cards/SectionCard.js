import React from "react";

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText
} from "reactstrap";

class SectionCard extends React.Component {
  render() {
    const { title, desc, onClick = () => {}, onDelete = null, href, button = "Edit" } = this.props;
    return (
      <Card className="room-card mr-3">
        <CardBody>
          <CardTitle tag="h4">{title}</CardTitle>
          <CardText>
            {desc}
          </CardText>
          <Button
            color="info"
            onClick={e => {onClick(title)} }
            href={href}
          >
            {button}
          </Button>
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