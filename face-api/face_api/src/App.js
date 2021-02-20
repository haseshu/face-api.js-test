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

//start_load_modulesするけどend_load_modulesしない。
const loadModels = async () => {
  console.log("start_load_modules")
    await faceapi.nets.tinyFaceDetector.load('/models')
    console.log("end_load_modules")
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
  resize(descriptions, width, height) {
    return descriptions.map(m => m.faceDetection.forSize(width, height))
  }
  draw(descriptions, canvas) {
    descriptions.map(f => faceapi.drawDetection(canvas, f, { withScore: true }))
  }

  capture = () => {
    const imgSrc = this.webcam.getScreenshot();
    const imgList = this.state.imgList;
    let canvas = document.createElement('canvas');
    console.log("imgSrc is"+imgSrc);

    canvas.width = imgSrc.clientWidth;
    canvas.height = imgSrc.clientHeight;
    canvas.getContext('2d').drawImage(imgSrc, 0, 0, canvas.width ,canvas.height);

//この辺を直す
//faceapiは画像をbase64にする必要があるみたい。

    canvas.toDataURL("image/jpeg");
    //this.detection(imgSrc)
    this.detection(canvas.toDataURL("image/jpeg"))
    .then((result) => {
      // canvasサイズをvideo（streamではなくhtml要素の方）に合わせる
      console.log("result is"+result)
      canvas.width = imgSrc.clientWidth
      canvas.height = imgSrc.clientHeight
      // 映像をcanvasに描画
      canvas.getContext('2d').drawImage(imgSrc, 0, 0, canvas.width, canvas.height)
      // 検出結果をリサイズ
      const resized = this.resize(result, canvas.width, canvas.height)
      // 検出結果をcanvasに描画
      this.draw(resized, canvas)
    })
    .catch((error) =>{
      console.log("have error "+ error)

    }
    )

    this.setState({ imgList: imgList.concat([imgSrc]) });
    this.setState({ imgList: imgList.concat([canvas]) });
  }

  switchCamera = () => {
    const nowFacingMode = this.state.isFacingModeUser
    this.setState({ isFacingModeUser: !nowFacingMode});
  }
  
  componentDidMount(){
    console.log("start did mount")
    this.switchCamera()
    loadModels()
    
  }
//ここを直す
//video用ではなく、画像用にする。
//faceapi.detectAllFacesを使う
  detection(video) {
    console.log("識別開始")
    return new Promise((resolve, reject) => {
      const params = { maxNumScales: 10, scaleFactor: 0.709, scoreThresholds: [0.6, 0.7, 0.7], minFaceSize: 20 }
      console.log("start tinyFaceDetector")
      
      //faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      faceapi.tinyFaceDetector(video, params)
      .then(result => resolve(result))
      .catch(error => reject(error))
      console.log("end tinyFaceDetector")
    })
  }
  
  resize(descriptions, width, height) {
    return descriptions.map(m => m.faceDetection.forSize(width, height))
  }

  draw(descriptions, canvas) {
    descriptions.map(f => faceapi.drawDetection(canvas, f, { withScore: true }))
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
