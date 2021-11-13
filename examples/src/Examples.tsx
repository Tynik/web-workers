import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { withRouter, useLocation } from 'react-router';
import { Grid, Tabs, Tab, Box } from '@material-ui/core';

import { BaseExample } from './BaseExample';
import { SimpleGeneratorExample } from './SimpleGeneratorExample';
import { FilesProcessingExample } from './FilesProcessingExample';
import { BrainJsXORExample } from './BrainJsXORExample';
import { PromiseResultExample } from './PromiseResultExample';

const Examples = (props) => {
  const location = useLocation();
  const [value, setValue] = React.useState<string>(location.pathname);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    props.history.push(newValue);
  };

  return (
    <Grid container>
      <Tabs orientation="vertical" value={value} onChange={handleChange}>
        <Tab label={'Home'} value={'/'}/>
        <Tab label={'Base'} value={'/base'}/>
        <Tab label={'Simple generator'} value={'/simple-generator'}/>
        <Tab label={'Promise result'} value={'/promise-result'}/>
        <Tab label={'Files processing'} value={'/files-processing'}/>
        <Tab label={'Brain.js'} value={'/brain-js-xor'}/>
      </Tabs>

      <Box p={2}>
        <Switch>
          <Route path="/base">
            <BaseExample/>
          </Route>
          <Route path="/simple-generator">
            <SimpleGeneratorExample/>
          </Route>
          <Route path="/promise-result">
            <PromiseResultExample/>
          </Route>
          <Route path="/files-processing">
            <FilesProcessingExample/>
          </Route>
          <Route path="/brain-js-xor">
            <BrainJsXORExample/>
          </Route>
          <Route path="/">
          </Route>
        </Switch>
      </Box>
    </Grid>
  );
};

export default withRouter(Examples);
