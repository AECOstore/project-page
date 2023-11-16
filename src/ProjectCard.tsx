import * as React from "react";
import {Card, CardContent, Button, Typography} from "@mui/material";
import {Redirect} from 'react-router-dom'
import { findReferenceRegistry } from "consolid-raapi";

const ProjectCard = ({piral, project}) => {
  const [projectClicked, setProjectClicked] = React.useState(false);
  const [loading, setLoading ] = React.useState(false);
  const constants = piral.getData("CONSTANTS")

  async function activateProject() {
    setLoading(true)
    const p = await piral.loadProject(piral, project)
    setLoading(false)
    piral.setDataGlobal(constants.ACTIVE_PROJECT, p)
    setProjectClicked(true);
  }

  return (
    <div>
          {projectClicked ? (
      <Redirect to="/" />
    ) : (
          <Card style={{top: 30, width: 300}} variant="outlined">
            <CardContent>
              <Typography variant="h5" component="h5">
                {project}
              </Typography>
              <Button
            // className={classes.button}
            style={{top: 10, position: "relative"}}
            variant="contained"
            color="primary"
            fullWidth
            onClick={activateProject}
            disabled={loading}
          >
            Activate Project
          </Button>
            </CardContent>

          </Card>)}
    </div>
  )

};

export default ProjectCard;