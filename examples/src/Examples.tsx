import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { withRouter, useLocation } from 'react-router';
import { Grid, Tabs, Tab, Box } from '@material-ui/core';

import {
  ReactPureExample,
  ReactBaseExample,
  ReactSimpleGeneratorExample,
  ReactFilesProcessingExample,
  ReactBrainJsXORExample,
  ReactPromiseResultExample
} from './React';

const Examples = (props) => {
  const location = useLocation();
  const [value, setValue] = React.useState<string>(location.pathname);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    props.history.push(newValue);
  };

  return (
    <Grid container>
      <Tabs
        value={value}
        onChange={handleChange}
        orientation={'vertical'}
      >
        <Tab label={'Home'} value={'/'}/>
        <Tab label={'React Pure'} value={'/react/pure'}/>
        <Tab label={'React Base'} value={'/react/base'}/>
        <Tab label={'React Simple generator'} value={'/react/simple-generator'}/>
        <Tab label={'React Promise result'} value={'/react/promise-result'}/>
        <Tab label={'React Files processing'} value={'/react/files-processing'}/>
        <Tab label={'React Brain.js'} value={'/react/brain-js-xor'}/>
      </Tabs>

      <Box p={2}>
        <Switch>
          <Route path="/" exact>
          </Route>
          <Route path="/react/pure">
            <ReactPureExample/>
          </Route>
          <Route path="/react/base">
            <ReactBaseExample/>
          </Route>
          <Route path="/react/simple-generator">
            <ReactSimpleGeneratorExample/>
          </Route>
          <Route path="/react/promise-result">
            <ReactPromiseResultExample/>
          </Route>
          <Route path="/react/files-processing">
            <ReactFilesProcessingExample/>
          </Route>
          <Route path="/react/brain-js-xor">
            <ReactBrainJsXORExample/>
          </Route>
        </Switch>
      </Box>
    </Grid>
  );
};

export default withRouter(Examples);
