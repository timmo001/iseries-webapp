import React, { Component } from 'react';
import PropTypes from 'prop-types';
import request from 'superagent';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Table from './Table/Table';
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
    margin: theme.spacing.unit
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
  }
});

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      success: false
    };
  };

  sql = cb => {
    const apiUrl = `${process.env.REACT_APP_API_PROTOCOL ||
      'http:'}//${process.env.REACT_APP_API_HOSTNAME ||
      'localhost'}:${process.env.REACT_APP_API_PORT || '28365'}`;

    request
      .post(`${apiUrl}/sql`)
      .send({
        hostname: process.env.REACT_APP_SERVER_HOSTNAME,
        username: process.env.REACT_APP_SERVER_USERNAME,
        password: process.env.REACT_APP_SERVER_PASSWORD,
        command: `SELECT SMSITE,SSNAME,SSROAD,SSLOCA,SSSP08 FROM CDLIVDTA.BSIT`
      })
      .retry(2)
      .timeout({
        response: 5000,
        deadline: 30000,
      })
      .then(res => {
        if (res.status === 200) {
          cb(res.body);
        } else {
          console.error(`Error ${res.status}: ${res.body}`);
          new Notification('Error', { body: `${res.status}: ${res.body}` });
          this.setState({ failed: true, error: `Error ${res.status}: ${res.body}\nCheck your credentials and try again` }, () =>
            setTimeout(() => this.setState({ error: undefined }), 20000));
        }
      })
      .catch(err => {
        if (err.response) {
          console.error(`Error: ${err.status} - ${err.response.text}`);
          new Notification('Error', { body: `${err.status} - ${err.response.text}` });
          this.setState({ error: `Error: ${err.status} - ${err.response.text}` }, () =>
            setTimeout(() => this.setState({ error: undefined }), 8000));
        } else {
          console.error(`Error: ${err.message} - Check your credentials and try again`);
          new Notification('Error', { body: `${err.message}` });
          this.setState({ error: `Error: ${err.message} - Check your credentials and try again` }, () =>
            setTimeout(() => this.setState({ error: undefined }), 8000));
        }
      });
  };

  handleChange = event => this.setState({ [event.target.name]: event.target.value });

  render() {
    const { classes } = this.props;
    const { data } = this.state;
    return (
      <div className={classes.root}>
        <Grid
          container
          justify="center"
          spacing={8}>
          <Grid item xs={12}>
          <Paper className={classes.paper}>
              <Button className={classes.button} variant="extendedFab" color="primary" onClick={this.sql}>
                <SendIcon />
                Run
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            {data &&
              <Paper className={classes.paper}>
                <Table data={data} />
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
