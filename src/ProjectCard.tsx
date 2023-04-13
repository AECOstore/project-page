import * as React from "react";
import {Card, CardContent, Button, Typography} from "@mui/material";
import {Redirect} from 'react-router-dom'
import { findReferenceRegistry } from "consolid-raapi";

const ProjectCard = ({piral, project}) => {
  const [projectClicked, setProjectClicked] = React.useState(false);
  const constants = piral.getData("CONSTANTS")

  async function activateProject() {
    const accessPoints = await piral.findProjectEndpoints(project)
    console.log('accessPoints :>> ', accessPoints);
    const data = []
    for (const ap of accessPoints) {
      
      const refReg = await findReferenceRegistry(ap)
      console.log('refReg :>> ', refReg);
      const endpoint = await piral.findSparqlSatelliteFromResource(ap)
      console.log('endpoint :>> ', endpoint);
      const pod = ap.split('/').slice(0,-1).join('/') + "/"
      if (endpoint) {data.push({
        projectUrl: ap,
        pod,
        endpoint,
        referenceRegistry: refReg
      })}
    }
    console.log('project', JSON.stringify(data, undefined, 4))
    piral.setDataGlobal(constants.ACTIVE_PROJECT, data)

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
          >
            Activate Project
          </Button>
            </CardContent>

          </Card>)}
    </div>
  )

};

export default ProjectCard;