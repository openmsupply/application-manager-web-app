# Webpack setup

## References

Inital setup was done following this tutorial: https://medium.com/free-code-camp/learn-webpack-for-react-a36d4cac5060

Semantic-ui on Webpack tutorial: https://medium.com/webmonkeys/webpack-2-semantic-ui-theming-a216ddf60daf

Typescript in webpack tutorial: https://www.smashingmagazine.com/2020/05/typescript-modern-react-projects-webpack-babel/#comments-typescript-modern-react-projects-webpack-babel

Hot loading App tutorial: https://dev.to/cronokirby/react-typescript-parcel-setting-up-hot-module-reloading-4f3f

## Init

**Note**: This setup is using _yarn_ to install npm packages.

- Create basic structure:

`yarn init -y`\
`mkdir public`\
`mkdir src`\

## Webpack with React and Typescrit

### Install dependecies (React)

`yarn add react react-dom react-router-dom`

### Install dev dependencies (Typescript + loaders + webpack)

`yarn add -D typescript @types/node @types/react @types/react-dom @types/react-router-dom react-hot-loader awesome-typescript-loader source-map-loader css-loader style-loader html-webpack-plugin webpack webpack-dev-server webpack-cli webpack-merge`

### Configure Typescript

- Add a file `tsconfig.json` for all your Typescript configurations:

`touch tsconfig.json`

- Open the file `tsconfig.json` and copy the following Typescript configuration:

```
{
  "compilerOptions": {
    "jsx": "react",
    "module": "commonjs",
    "noImplicitAny": true,
    "outDir": "./build/",
    "preserveConstEnums": true,
    "removeComments": true,
    "sourceMap": true,
    "target": "es5",
    "esModuleInterop": true
    "resolveJsonModule": true
  },
  "include": [
    "src/*"
  ]
}
```

### Add some content to the public folder

`cd public`\
`touch index.html`

- Add the `favicon.ico` in here to load on the tab.

- Open `public/index.html` and copy the following:

```
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Application Manager</title>
</head>

<body>
  <div id="root"></div>
</body>

</html>
```

### Create a very basic App

- Create the entry file with .tsx (Typescript) extension:

`cd src`\
`touch index.tsx`

- Open `index.tsx` and copy the following:

```
import React from 'react'
import ReactDOM from 'react-dom'

ReactDOM.render(
    <h1>Hello world</h1>,
    document.getElementById('root')
);
```

## Webpack for initial setup

- Create on the webpack configuration file on root folder:

`touch webpack.config.js`

- Open `webpack.config.js` and copy the following:

```
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const port = process.env.PORT || 3000;

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/index.tsx',
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"]
  },
  output: {
    filename: 'bundle.[hash].js'
  },
  module: {
    rules: [
      // First Rule
      {
        test: /\.(ts|tsx)$/,
        loader: "awesome-typescript-loader",
      },
      // Second Rule
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localsConvention: 'camelCase',
              sourceMap: true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      favicon: 'public/favicon.ico'
    })
  ],
  devServer: {
    host: 'localhost',
    port: port,
    historyApiFallback: true,
    open: true
  }
}
```

- Run webpack dev server:

`npx webpack-dev-server`

## Semantic-ui React

- Install development dependencies (Semantic-ui, LESS and other loaders):

`yarn add -D semantic-ui-react semantic-ui-less less less-loader url-loader postcss-loader mini-css-extract-plugin`

`url-loader` is used for icons & images, you must make sure that your webpack configuration knows how to bundle them.

### Use Semantic-ui LESS locally

- Create a folder to store the local settings of Semantic-ui:

`mkdir -p semantic\src`

- Copy the files and folders from `node_modules/semantic-ui-less` to a local folder `semantic/src`:

`cp -Rf node_modules/semantic-ui-less/_site/ semantic/src/site`\
`cp -Rf node_modules/semantic-ui-less/definitions semantic/src/definitions`\
`cp -Rf node_modules/semantic-ui-less/themes semantic/src/themes`\
`cp node_modules/semantic-ui-less/theme.less node_modules/semantic-ui-less/semantic.less semantic/src/`\
`cp node_modules/semantic-ui-less/theme.config.example semantic/src/theme.config`

**Folders:**
`site` - Keeps custom style for each component (that's a step before actually creating a **custom package theme**). Change any style defined in here to see the change on the element after the App is recompiled.

`themes` - Has a folder for each **package theme** which can be setup per component on `theme.config` file.

`definitions` - Has JS files and LESS files. And basic definitions for each component. Imports `theme.config`.

**Files:**
`theme.config` - Configuration of variables to be used on `semantic.less` and each component **packaged theme**.

`theme.less` - Main LESS configuration for Semantic-ui Styling. Here the inheritance order is defined.

`semantic.less` - Just importing all the definintion folder. This file is imported in `index.js`.

- Open the `theme.config` file and copy change the last lines according with the following:

```
/*******************************
            Folders
*******************************/

/* Path to theme packages */
@themesFolder : "themes";

/* Path to site override folder */
@siteFolder  : "site";


/*******************************
         Import Theme
*******************************/

@import (multiple) "theme.less";

@fontPath : "../../../themes/@{theme}/assets/fonts";

/* End Config */
```

### Add semantic-ui to components in the App

- Create a folder `components` with one file:

`cd src`\
`mkdir components && cd $_`\
`touch App.tsx AppMenu.tsx Home.tsx Footer.tsx NoMatch.tsx Register.tsx`

- Open `Home.tsx` and copy the following:

```
import React from 'react'
import { Label } from 'semantic-ui-react'

const Home: React.FC = () => {
  return (
    <Label>Hello World of React and Webpack!</Label>
  )
}

export default Home
```

- Open `Footer.tsx` and copy the following:

```
import React from 'react'
import { Container, Icon } from 'semantic-ui-react'

const Footer: React.FC = () => (
    <Container textAlign="center">
        Footer
        <Icon name="react" />
    </Container>
)

export default Footer
```

- Open `NoMatch.tsx` and copy the following:

```
import React from 'react'
import { Icon, Segment } from 'semantic-ui-react'

const NoMatch: React.FC = () => {
  return (
    <Segment>
      <Icon name="minus circle" size="big" />
      <strong>Page not found!</strong>
    </Segment>
  )
}

export default NoMatch
```

- Open `Register.tsx` and copy the following:

```
import React, { useState } from 'react'
import { Button, Checkbox, Form, Message, Segment } from 'semantic-ui-react'

interface Snackbar {
    showMessage: boolean
    messageTitle: String
    messageText: String
    isErrorMessage: boolean
}

const Register: React.FC = () => {
    const [ snackbar, changeSnackback ] = useState<Snackbar>({ showMessage: false, messageTitle: '', messageText: '', isErrorMessage: false})

    const submitedObject: Snackbar = {
        showMessage: true,
        messageTitle: 'Snackbar is built',
        messageText: 'Congrats, you have pressed the Submit button!',
        isErrorMessage: false
    }

    const removeSnackbar = () => {
        changeSnackback({
            showMessage: false,
            messageText: '',
            messageTitle: '',
            isErrorMessage: false })
    }

    return (
        <Segment.Group>
            <Segment>
                <Form>
                    <Form.Field>
                        <label>First Name</label>
                        <input placeholder='First Name' />
                    </Form.Field>
                    <Form.Field>
                        <label>Last Name</label>
                        <input placeholder='Last Name' />
                    </Form.Field>
                    <Form.Field>
                        <Checkbox label='I agree to the Terms and Conditions' />
                    </Form.Field>
                    <Button
                        type='submit'
                        onClick={()=> {
                            changeSnackback(submitedObject)
                            setTimeout( () => {removeSnackbar()}, 2000)
                        }}>
                            Submit
                        </Button>
                </Form>
            </Segment>
            <Segment>
                <Message
                    success
                    hidden={!snackbar.showMessage}
                    header={snackbar.messageTitle}
                    content={snackbar.messageText}
                    error={snackbar.isErrorMessage}
                />
            </Segment>
        </Segment.Group>
    )
}

export default Register
```

- Open `AppMenu.tsx` and copy the following:

```
import React, { useState } from 'react'
import { Menu } from 'semantic-ui-react'
import { MenuItemProps } from 'semantic-ui-react'
import { Link, RouteComponentProps, withRouter } from 'react-router-dom'

interface AppMenuProps extends RouteComponentProps {
    items: Array<Array<String>>
}

const AppMenu: React.FC<AppMenuProps> = (props: AppMenuProps) => {
    const [activeItem, setActiveItem] = useState<String>('Home')
    const handleItemClick = (event: any, {children} : MenuItemProps) => {
        setActiveItem(children as String)
    }

    let menuItems = []
    for (let i = 0; i < props.items.length; i++) {
        if (props.items[i].length !== 2) {
            console.error(
                'AppMenu: items format should be ["name", "route"]'
            )
            break
        }
        const name = props.items[i][0]
        const route = props.items[i][1]

        menuItems.push(
            <Menu.Item header
                key={`app_menu_${name}`}
                active={(activeItem === name)}
                onClick={handleItemClick}
                as={Link}
                to={route}>
                {name}
            </Menu.Item>)
    }

    return (
        <Menu fluid vertical tabular>
            {menuItems}
        </Menu>
    )
}

export default withRouter(AppMenu)
```

- Open `App.tsx` and copy the following:

```
import React from "react"
import { hot } from 'react-hot-loader'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { Grid, Segment } from 'semantic-ui-react'

import AppMenu from './AppMenu'
import Footer from './Footer'
import Home from './Home'
import NoMatch from './NoMatch'
import Register from './Register'

const App: React.FC = () => {
  return (
    <div>
        <Router>
            <Grid>
                <Grid.Column width={4}>
                    <AppMenu
                            items={[
                                ['Home', '/'],
                                ['Register', '/form']
                            ]}
                        />
                </Grid.Column>
                <Grid.Column stretched width={12}>
                    <Segment>
                        <Switch>
                            <Route path='/' exact component={Home} />
                            <Route path='/form' component={Register} />
                            <Route component={NoMatch} />
                        </Switch>
                    </Segment>
                </Grid.Column>
            </Grid>
        </Router>
        <Footer />
    </div>
    )
}

declare const module: any
export default hot(module)(App)
```

- Open `src/index.tsx` and copy the following:

```
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import '../semantic/src/semantic.less'

ReactDOM.render(
  <App/>,
  document.getElementById("root")
)
```

### Webpack composition

- Create the folder build-tools on the root for webpack composition files:

`mkdir -p build-utils/addons`\
`cd build-utils`\
`touch build-validations.js common-paths.js webpack.common.js webpack.dev.js webpack.prod.js`

- Open `common-paths.js` and copy the following:

```
const path = require('path');
const PROJECT_ROOT = path.resolve(__dirname, '../');

module.exports = {
  projectRoot: PROJECT_ROOT,
  outputPath: path.join(PROJECT_ROOT, 'dist'),
  appEntry: path.join(PROJECT_ROOT, 'src')
};
```

- Open `build-validations.js` and copy the following:

```
const chalk = require('chalk');
const ERR_NO_ENV_FLAG = chalk.red(
  `You must pass an --env.env flag into your build for webpack to work!`
);

module.exports = {
  ERR_NO_ENV_FLAG
};
```

- Open `webpack.common.js` and copy the following:

```
const commonPaths = require('./common-paths')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const config = {
  entry: {
    app: [`${commonPaths.appEntry}/index.tsx`],
    vendor: ['semantic-ui-react']
  },
  output: {
    path: commonPaths.outputPath,
    publicPath: '/'
  },
  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: "awesome-typescript-loader",
      },
      {
        // Load fonts
        test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
        use: 'url-loader',
      },
      {
        // Load other files, images etc
        test: /\.(png|j?g|gif|ico)?$/,
        use: 'url-loader',
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        },
        vendor: {
          chunks: 'initial',
          test: 'vendor',
          name: 'vendor',
          enforce: true
        }
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
      favicon: 'public/favicon.ico'
    })
  ]
}

module.exports = config
```

- Open `webpack.dev.js` and copy the following:

```
const commonPaths = require('./common-paths');
const webpack = require('webpack');
const port = process.env.PORT || 3000;

const config = {
  mode: 'development',
  output: {
    filename: '[name].[hash].js'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
          test: /\.less$/,
          use: [
              'style-loader',
              {
                  loader: 'css-loader',
                  options: {
                      importLoaders: 2,
                  },
              },
              'postcss-loader',
              'less-loader',
          ]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer: {
    host: 'localhost',
    port: port,
    historyApiFallback: true,
    hot: true,
    open: true
  }
};
module.exports = config;
```

- Open `webpack.prod.js` and copy the following:

```
const commonPaths = require('./common-paths')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const config = {
  mode: 'production',
  output: {
    filename: 'static/[name].[hash].js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.less$/,
          use: [
            {
              // We configure 'MiniCssExtractPlugin'
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 2,
                sourceMap: true
              }
            },
            'postcss-loader',
            'less-loader'
          ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:4].css'
    })
  ]
};
module.exports = config
```

- Open `webpack.config.js` and copy the following:

```
const buildValidations = require('./build-utils/build-validations');
const commonConfig = require('./build-utils/webpack.common');

const { merge } = require('webpack-merge');

// We can include Webpack plugins, through addons, that do
// not need to run every time we are developing.
// We will see an example when we set up 'Bundle Analyzer'
const addons = (/* string | string[] */ addonsArg) => {

  // Normalize array of addons (flatten)
  let addons = [...[addonsArg]]
    .filter(Boolean); // If addons is undefined, filter it out

  return addons.map(addonName =>
    require(`./build-utils/addons/webpack.${addonName}.js`)
  );
};

// 'env' will contain the environment variable from 'scripts'
// section in 'package.json'.
// console.log(env); => { env: 'dev' }
module.exports = env => {

  // We use 'buildValidations' to check for the 'env' flag
  if (!env) {
    throw new Error(buildValidations.ERR_NO_ENV_FLAG);
  }

  // Select which Webpack configuration to use; development
  // or production
  // console.log(env.env); => dev
  const envConfig = require(`./build-utils/webpack.${env.env}.js`);

  // 'webpack-merge' will combine our shared configurations, the
  // environment specific configurations and any addons we are
  // including
  const mergedConfig = merge(
    commonConfig,
    envConfig,
    ...addons(env.addons)
  );

  // Then return the final configuration for Webpack
  return mergedConfig;
}
```

- Install packages for PostCSS transpiling

Since we added PostCSS to the webpack configuration, we need to install and configure it:

`yarn add -D postcss-loader autoprefixer chalk cssnano postcss-preset-env`

- Create a configuration file for it:

`touch postcss.config.js`

- Open the `postcss.config.js` and copy the following:

```
const postcssPresetEnv = require('postcss-preset-env')
module.exports = {
  plugins: [
    postcssPresetEnv({
      browsers: ['>0.25%', 'not ie 11', 'not op_mini all']
    }),
    require('cssnano')
  ]
}
```

## Building the app with webpack

- Add some util dev dependencies to the project:

`yarn add -D rimraf cross-env serve`

- Open `package.json` to add the following scripts:

```
    "scripts": {
    "dev": "webpack-dev-server --env.env=dev",
    "prebuild": "rimraf dist",
    "build": "cross-env NODE_ENV=production webpack -p --env.env=prod",
    "serve": "serve dist"
    },
```

- Test running on development mode:

`yarn dev`

- Test bundle for production:

`yarn build`

- Test serving bundled app:

`yarn serve`

## Basic setup finished

Great job!

Now we have the basic front-end repo configured to use Semantic-ui React components with themes that use LESS files to define the style for each semantic-ui React component used in the App.

### App style

On the `semantic/src/themes` folder are your **package themes** and `semantic/src/theme.config` keeps what style theme is being used for each component. You can create a new theme folder and use by its name.

The styles are inherited from `default` package theme. So, even if you change on `theme.config` to use another package theme what isn't defined there will be using the `default` style. You can also use definitions on `semantic/src/site` folder to add custom style on top of the selected package theme for each component.

## Prettier & Eslint for code styling

### Install dev dependencies

`yarn add -D eslint eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks`

### Configure Prettier and Eslint

- Create the config files for prettier eslint on the root:
  `touch .prettierrc .eslintrc`

- Open `.prettierrc` and copy the following:

```
{
  "bracketSpacing": true,
  "printWidth": 100,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

- Open `.eslintrc` and copy the following:

```
{
  "env": { "jest": true },
  "extends": "airbnb",
  "globals": {
    "fetch": false
  },
  "plugins": ["prettier"],
  "rules": {
    "arrow-body-style": ["error", "as-needed"],
    "arrow-parens": ["error", "as-needed"],
    "comma-dangle": [
      "error",
      {
        "arrays": "always-multiline",
        "exports": "always-multiline",
        "functions": "never",
        "imports": "always-multiline",
        "objects": "always-multiline"
      }
    ],
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "function-paren-newline": "off",
    "implicit-arrow-linebreak": "off",
    "import/prefer-default-export": "off",
    "indent": ["error", 2, { "SwitchCase": 1 }],
    "max-len": ["error", { "code": 100, "ignoreTemplateLiterals": true }],
    "no-underscore-dangle": "off",
    "no-confusing-arrow": "off",
    "no-param-reassign": "off",
    "no-use-before-define": ["error", { "variables": false }],
    "object-curly-newline": ["error", { "ObjectPattern": { "multiline": true } }],
    "operator-linebreak": "off",
    "prettier/prettier": "error",
    "quotes": ["error", "single", { "avoidEscape": true }],
    "react/jsx-boolean-value": "off",
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "react/jsx-one-expression-per-line": "off",
    "react/jsx-props-no-spreading": "off",
    "strict": "off"
  }
}
```

- Add one pre-commit hook for linting stagged files:

`npx mrm lint-staged`

This will install husky and lint-staged, then add a configuration to the project’s package.json that will automatically format supported files in a pre-commit hook.

## Node minimal version

Since Semantic-ui-less doesn't run well in node v10.15.0 there is a resctriction on the `package.json` when installing this sub-project. Setup installation error to check if using node >v13.8.0: [Package.json docs](https://docs.npmjs.com/files/package.json#engines)

- Added in `package.json`:

  `"engines" : { "node" : ">=13.8.0" }`

- New file on the root folder (same as package.json) `.npmrc` with:

  `engine-strict=true`

### Testing

- Change to node v10.15.0 (example using nvm):

  `nvm use v10.15.0`

- Remove existing installed dependencies and re-install:

  `rm -rf node_modules`\
   `yarn install`

- Check out the error displayed:
  ![error-node-version](images/Webpack-error-node-version.png)

**Note**: You need to be using a node version > v13.8.0 to build this project.

To check out what is your node version:

`node -v`

# Summary

Webpack setp

## Included packages:

- **Typescript**
- **React**
- **React-dom**
- **React-router-dom**
- **Hot loading**
- **Semantic-ui-react**
- **LESS**

### Back

- [Home](Home.md)

## Next

- [Apollo client](apollo-client.md)
- [Auth & App Router]
- [Themes]
