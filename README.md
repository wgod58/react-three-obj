# Documentation for Imersive

## Start the project

```shell
npm install
npm start
```

The webpage should open in a browser. The project is reloading the page when the source code is modified.
Please see the documentation from the template below for more details about the project's setup.
It was made using the `create-react-app` template.

## The source code

The source code is using the library `[react-three-fiber](https://github.com/drcmda/react-three-fiber)`
that wraps some of the THREE.JS 3D primitives inside of React components.

Most of the code should be very straight forward to read as it is using the React approach
to combine together the 3D primitives of the 3D scene.
The code is easy to tweak, the parameters are passed to the components via Props, same as React.

The main file containing all the source code is in `src/component/ModelViewer.jsx`, and the main component
is at the very bottom of the file, named `ModelViewer`.
It is written directly as a render function using React Hooks.

The 3D scene is described within the `<Canvas>...</Canvas>` tags. The primitives
represented inside are displayed 30~60 times per second (I am not sure what is the default refresh rate of THREE.JS).
To give the impression of moving the model on the side of the screen, you can either change the position of the camera or change the position of the group which contains the human 3D model and the animated line component (at the line 360).

There is an example of a value being animated inside the `AnimatedLines` component, you can use the same technic or use a third party library if you prefer (maybe https://react-move.js.org/).

`Controls` is the component that controls the position of the camera around a fixed point. It responds to user inputs and is documented in THREE.JS.

`BackgroundSphere` is a big sphere that is around the scene, it displays the background.

The rest of the code should be easy to read. If you still need some explanations about
something specific, please send me an email and I will try to answer within a few days.

Do not hesitate to look into the Git repository's history to understand how each part
was added, it may help.

-- Vincent

--------------------------------------------------------------------------------

# Documentation from the template

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
