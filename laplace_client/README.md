# laplace_client
The front-end of the Laplace webapp.
Built using React.

## Setup
1. `npm install`
2. Create a .env file in this directory, and set `REACT_APP_API_URL`.
Example:
```
REACT_APP_API_URL=https://laplace_api.com
```
3. Change the `PORT` inside of `package.json` to whatever port you want the front-end to listen on.
4. Run `npm run-script dev` to start the development server, or `npm run-script build && npm run-script start` to build the app and start the production server.

## License
The front-end is based off of the [Now UI Kit React](https://www.creative-tim.com/product/now-ui-kit-react) by Creative Tim, licensed under the MIT [LICENSE](LICENSE).
