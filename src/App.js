import React from 'react';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import grey from '@material-ui/core/colors/grey';
import blueGrey from '@material-ui/core/colors/blueGrey';
import cyan from '@material-ui/core/colors/cyan';
import red from '@material-ui/core/colors/red';
import Main from './Components/Main';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: blueGrey,
    secondary: cyan,
    mainBackground: grey[900],
    error: red,
    contrastThreshold: 3,
    tonalOffset: 0.2
  },
});

export default class App extends React.Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <Main />
      </MuiThemeProvider>
    );
  }
}
