import React from "react";

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText,
  Progress 
} from "reactstrap";

import { Link } from "react-router-dom";

function RoomCard({ title, desc, completed, buttons = [] }) {
  let progress;
  if(completed) {
    progress = (completed.sections.length/completed.room.sections.length)*100;
  }
  return (
    <Card className="room-card mr-3 mb-3">
      <CardBody>
        <CardTitle tag="h4">
          {title} {completed && progress === 100 && <i className="fas fa-check text-success"></i>}
        </CardTitle>
        <CardText>
          {desc}
        </CardText>
        {buttons && buttons.map((button, i) => {
          return button.to ? (
             <Button
              key={i}
              color={button.color || "info"}
              onClick={e => {button.onClick && button.onClick(title)} }
              tag={Link}
              to={button.to}
            >
              {button.text}
            </Button>
          ) : (
            <Button
              key={i}
              color={button.color || "info"}
              onClick={e => {button.onClick && button.onClick(title)} }
            >
              {button.text}
            </Button>
          )
        })}
        {completed && (
          <div className="progress-container progress-success mb-2">
            <Progress max="100" value={progress}>
              <span className="progress-value">{parseInt(progress) || 0}%</span>
            </Progress>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default RoomCard;