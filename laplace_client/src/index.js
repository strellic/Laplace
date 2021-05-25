import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { AuthProvider } from "context/auth.js";
import { AlertProvider } from "context/alert.js";

import "assets/css/bootstrap.min.css";
import "assets/scss/styles.scss";
import "assets/scss/now-ui-kit.scss?v=1.4.0";
import "assets/demo/demo.css?v=1.4.0";

import "../node_modules/highlight.js/styles/monokai-sublime.css";

import Index from "views/Index.js";
import LoginPage from "views/LoginPage.js";
import RegisterPage from "views/RegisterPage.js";
import LogoutPage from "views/LogoutPage.js";
import HomePage from "views/HomePage.js";
import ProfilePage from "views/ProfilePage.js";
import IDEPage from "views/IDEPage.js";

import CreatePage from "views/rooms/CreatePage.js";
import ViewPage from "views/rooms/ViewPage.js";
import ListPage from "views/rooms/ListPage.js";

ReactDOM.render(
  <AuthProvider>
    <BrowserRouter>
      <AlertProvider>
          <Switch>
            <Route
              path="/login"
              render={(props) => <LoginPage {...props} />}
            />
            <Route
              path="/register"
              render={(props) => <RegisterPage {...props} />}
            />
            <Route
              path="/logout"
              render={(props) => <LogoutPage {...props} />}
            />
            <Route path="/home" render={(props) => <HomePage {...props} />} />
            <Route path="/profile/:target?" render={(props) => <ProfilePage {...props} />} />
            <Route path="/ide" render={(props) => <IDEPage {...props} />} />
            <Route
              path="/rooms/create"
              render={(props) => <CreatePage {...props} />}
            />
            <Route
              path="/rooms/edit/:code"
              render={(props) => <CreatePage {...props} />}
            />
            <Route
              path="/rooms/view/:code"
              render={(props) => <ViewPage {...props} />}
            />
            <Route
              path="/rooms/list"
              render={(props) => <ListPage {...props} />}
            />
            <Route path="/" render={(props) => <Index {...props} />} />
          </Switch>
      </AlertProvider>
    </BrowserRouter>
  </AuthProvider>,
  document.getElementById("root")
);
