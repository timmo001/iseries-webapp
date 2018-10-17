import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Table from './Table/Table';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import SendIcon from '@material-ui/icons/Send';

const styles = theme => ({
  root: {
    position: 'absolute',
    height: 'calc(100% - 72px)',
    width: 'calc(100% - 32px)',
    maxHeight: '100%',
    maxWidth: '100%',
    padding: '8px 16px 64px 16px',
    flexGrow: 1,
    // marginTop: -8,
    // marginLeft: -8,
    background: theme.palette.mainBackground
  },
  paper: {
    margin: theme.spacing.unit,
    textAlign: 'center'
  },
  button: {
    margin: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`
  },
  form: {
    display: 'flex'
  },
  formControl: {
    flexGrow: 1,
    margin: '0 12px'
  },
  progress: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)'
  },
  textField: {
    flexBasis: '50%',
  },
  margin: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit}px`
  },
  header: {
    padding: `0 ${theme.spacing.unit * 2}px`
  },
  error: {
    padding: theme.spacing.unit
  }
});

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hostname: localStorage.getItem('hostname') || '',
      username: localStorage.getItem('username') || '',
      password: localStorage.getItem('password') || '',
      command: localStorage.getItem('command') || '',
      showPassword: false,
      loading: false,
      success: false
    };
  }

  componentDidMount = () => this.handleValidation();

  sql = () => {
    const ws = new WebSocket(
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${
      process.env.REACT_APP_WS_URL || window.location.hostname}:${process.env.REACT_APP_WS_PORT || 28365}`
    );

    ws.onopen = () => {
      console.log("WebSocket connected");
      this.setState({ connected: true });

      localStorage.setItem('hostname', this.state.hostname);
      localStorage.setItem('username', this.state.username);
      localStorage.setItem('password', this.state.password);
      localStorage.setItem('command', this.state.command);

      ws.send(JSON.stringify({
        request: 'sql',
        hostname: process.env.REACT_APP_SERVER_HOSTNAME || this.state.hostname,
        username: process.env.REACT_APP_SERVER_USERNAME || this.state.username,
        password: process.env.REACT_APP_SERVER_PASSWORD || this.state.password,
        command: this.state.command,
        get_columns: true
      }));
    };

    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.result || response.result.length > 0) {
        if (response.columns) {
          const columns = [];
          Object.keys(response.result[0]).map(k =>
            response.columns.map(t =>
              t.data.map(c =>
                c.COLUMN_NAME === k && columns.push({ name: c.COLUMN_NAME, title: `${c.COLUMN_TEXT} (${c.COLUMN_NAME})` })
              )
            )
          );
          this.setState({ columns });
        }
        this.setState({ data: response.result });
      } else console.log('No data returned');
    };
  };

  handleMouseDownPassword = event => event.preventDefault();

  handleClickShowPassword = () => this.setState({ showPassword: !this.state.showPassword });

  handleChange = prop => event => this.setState({ [prop]: event.target.value }, () => {
    this.handleValidation();
  });

  handleValidation = () => {
    if (!this.state.username) { this.setState({ invalid: 'No username!' }); return; }
    if (!this.state.password) { this.setState({ invalid: 'No password!' }); return; }
    if (!this.state.hostname) { this.setState({ invalid: 'iSeries Host invalid!' }); return; }
    if (!this.state.command.toLowerCase().startsWith('select')) { this.setState({ invalid: 'Command must start with select' }); return; }
    if (!this.state.command.includes('from')) { this.setState({ invalid: 'Command must contain a from statement' }); return; }
    // if (!this.state.command.includes('.') || !this.state.command.includes('/')) {
    //   this.setState({ invalid: 'Command must contain a set schema/library (MYSCHEMA.MYTABLE)' }); return;
    // }
    this.setState({ invalid: undefined });
  };

  render() {
    const { classes } = this.props;
    const { columns, data, hostname, username, password, command, showPassword, invalid } = this.state;
    return (
      <div className={classes.root}>
        <Grid
          container
          justify="center"
          component="form"
          spacing={8}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
              <Grid
                className={classes.header}
                container
                justify="space-between"
                spacing={8}>
                {!process.env.REACT_APP_SERVER_HOSTNAME &&
                  <Grid item>
                    <FormControl className={classNames(classes.margin, classes.textField, classes.fakeButton)}>
                      <InputLabel htmlFor="hostname">iSeries Hostname</InputLabel>
                      <Input
                        required
                        id="hostname"
                        type="text"
                        inputProps={{
                          autoCapitalize: "none"
                        }}
                        value={hostname}
                        onChange={this.handleChange('hostname')}
                        onKeyPress={this.handleKeyPress} />
                    </FormControl>
                  </Grid>
                }
                {!process.env.REACT_APP_SERVER_USERNAME &&
                  <Grid item>
                    <FormControl className={classNames(classes.margin, classes.textField, classes.fakeButton)}>
                      <InputLabel htmlFor="username">Username</InputLabel>
                      <Input
                        required
                        id="username"
                        type="text"
                        inputProps={{
                          autoCapitalize: "none"
                        }}
                        value={username}
                        onChange={this.handleChange('username')}
                        onKeyPress={this.handleKeyPress} />
                    </FormControl>
                  </Grid>
                }
                {!process.env.REACT_APP_SERVER_PASSWORD &&
                  <Grid item>
                    <FormControl className={classNames(classes.margin, classes.textField)}>
                      <InputLabel htmlFor="password">Password</InputLabel>
                      <Input
                        required
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        inputProps={{
                          autoCapitalize: "none"
                        }}
                        value={password}
                        onChange={this.handleChange('password')}
                        onKeyPress={this.handleKeyPress}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="Toggle password visibility"
                              onClick={this.handleClickShowPassword}
                              onMouseDown={this.handleMouseDownPassword}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        } />
                    </FormControl>
                  </Grid>
                }
                <Grid item xs>
                  <FormControl className={classNames(classes.margin, classes.textField, classes.fakeButton, classes.command)} fullWidth>
                    <InputLabel htmlFor="command">SQL Command</InputLabel>
                    <Input
                      required
                      id="command"
                      type="text"
                      inputProps={{
                        autoCapitalize: "none"
                      }}
                      value={command}
                      onChange={this.handleChange('command')}
                      onKeyPress={this.handleKeyPress} />
                  </FormControl>
                </Grid>
                <Grid item>
                  <Button className={classes.button} variant="extendedFab" color="primary" onClick={this.sql} disabled={invalid !== undefined}>
                    <SendIcon />
                    Run
                  </Button>
                </Grid>
              </Grid>
              {invalid &&
                <Typography color="error" className={classes.error}>
                  {invalid}
                </Typography>
              }
            </Paper>
          </Grid>
          <Grid item xs={12}>
            {data &&
              <Paper className={classes.paper}>
                <Table
                  columns={columns}
                  data={data} />
              </Paper>
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

Main.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Main);
