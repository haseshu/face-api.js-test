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
    console.log("drawDetections")
    return faceapi.draw.drawDetections(canvas, descriptions.map(res => res.faceDetection), { withScore: true })
    //descriptions.map(f => faceapi.drawDetection(canvas, f, { withScore: true }))
  }

  Base64ToImage(base64img) {
    var img = new Image();
    img.src = base64img;
    console.log("base64img.width "+base64img.width);
    console.log("img.width "+img.width);
    return img;
}

  ImageToBase64(img, mime_type) {
  // New Canvas
  console.log("start ImageToBase64");
  var canvas = document.createElement('canvas');
  canvas.width  = img.width;
  canvas.height = img.height;
  // Draw Image
  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  // To Base64
  return canvas.toDataURL(mime_type);
}


  capture = () => {
    const imgSrc = this.webcam.getScreenshot();
    const imgList = this.state.imgList;
    let canvas = document.createElement('canvas');
    console.log("imgSrc is"+imgSrc);
    //ここからうまくいかない
    var image_not_base64 = this.Base64ToImage(imgSrc);
    var image_base64;
    console.log("image_not_base64 is"+image_not_base64);
    console.log("image_not_base64.clientWidth"+imgSrc.width);
    console.log("image_not_base64.clientHeight"+imgSrc.height);

    canvas.width = image_not_base64.clientWidth;
    canvas.height = image_not_base64.clientHeight;
    canvas.getContext('2d').drawImage(image_not_base64, 0, 0, canvas.width ,canvas.height);

//この辺を直す
//faceapiは画像をbase64にする必要があるみたい。

    //canvas.toDataURL("image/jpeg");
    //this.detection(imgSrc)
    this.detection(image_not_base64)
    .then((result) => {
      // canvasサイズをvideo（streamではなくhtml要素の方）に合わせる
      console.log("result is"+result);

      canvas.width = image_not_base64.clientWidth
      canvas.height = image_not_base64.clientHeight
      // 映像をcanvasに描画
      console.log("getContext");
      canvas.getContext('2d').drawImage(image_not_base64, 0, 0, canvas.width, canvas.height)
      // 検出結果をリサイズ
      //const resized = this.resize(result, canvas.width, canvas.height)
      // 検出結果をcanvasに描画
      console.log("draw");

      //this.draw(result, canvas)
      console.log("end draw");
      image_base64 = this.ImageToBase64(canvas,"image/jpeg");
    })
    .catch((error) =>{
      console.log("have error "+ error)

    }
    )

    //this.setState({ imgList: imgList.concat([imgSrc]) });
    this.setState({ imgList: imgList.concat([image_base64]) });
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
  /*
  resize(descriptions, width, height) {
    return descriptions.map(m => m.faceDetection.forSize(width, height))
  }
  */

  draw(descriptions, canvas) {
    //ここを直す
    //have error TypeError: faceapi.drawDetection is not a function
    /*
faceapi.draw.drawDetections('overlay', mtcnnResults.map(res => res.faceDetection), { withScore: false })
faceapi.draw.drawFaceLandmarks('overlay', mtcnnResults.map(res => res.faceLandmarks), { lineWidth: 4, color: 'red' })
    */
   console.log("draw-2")
    faceapi.draw.drawDetections(canvas, descriptions, { withScore: true })
    /*
    descriptions.map(f => {
      //return faceapi.drawDetection(canvas, f, { withScore: true })
    })
    */
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
