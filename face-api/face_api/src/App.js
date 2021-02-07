import React, { Component } from 'react';
import './App.css';
import Webcam from "react-webcam";
import { Grid, Icon, Fab, GridListTile, GridList } from '@material-ui/core';
import * as faceapi from 'face-api.js/dist/face-api.js';

const styles = {
  underlay: {
    position: "relative",
    width: 480,
    height: 640
  },
  camera: {
    position: "absolute",
    width: 480,
    height: 640,
  },
  button: {
    backgroundColor: "rgba(0,0,0,0)"
  }
};


const loadModels = async () => {
     await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(`/js/lib/models`)
    ]);
    console.log("load_modules")
};

class WebcamCapture extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFacingModeUser: false,
      imgList: []
    };
  }

  setRef = webcam => {
    this.webcam = webcam;
  }

  capture = () => {
    const imgSrc = this.webcam.getScreenshot();
    const imgList = this.state.imgList;
    this.setState({ imgList: imgList.concat([imgSrc]) });
  }

  switchCamera = () => {
    const nowFacingMode = this.state.isFacingModeUser
    this.setState({ isFacingModeUser: !nowFacingMode});
  }
  
  componentDidMount(){
    this.switchCamera()
    loadModels();
  }


  

  render() {
    const videoConstraints = {
      facingMode: this.state.isFacingModeUser ? "user" : "environment"
    };
    return (
      <Grid container justify="flex-start" alignItems="flex-start">
        <Grid item xs={12}>
          <Grid container justify="center" alignItems="center">
            <Grid item xs={4}>
              Camera
            </Grid>
            <Grid item xs={5} />
            <Grid item xs={3}>
              Result
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4}>
          <div style={styles.underlay}>
            <Webcam
              audio={false}
              style={styles.camera}
              ref={this.setRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
               onUserMediaError={() => window.alert('cant access your camera')}
            />
            <div style={styles.button}>
              <Fab
                style={styles.button}
                color="primary"
                onClick={this.capture}
              >
                <Icon> camera_enhance </Icon>
              </Fab>
              <Fab
                style={styles.button}
                color="primary"
                onClick={this.switchCamera}
              >
                <Icon> cached </Icon>
              </Fab>
            </div>
          </div>
        </Grid>
        <Grid item xs={5} />
        <Grid item xs={3}>
          <Grid container justify="flex-start" alignItems="flex-start">
            <Grid item xs={12}>
              <GridList cols={3}>
                {this.state.imgList.map(imgSrc => (
                  <GridListTile key={imgSrc} cols={1}>
                    <img src={imgSrc} />
                  </GridListTile>
                ))}
              </GridList>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
/*
video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
});
*/
export default WebcamCapture;
