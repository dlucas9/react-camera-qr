const { NoVideoInputDevicesError } = require('./errors')

function defaultDeviceIdChooser (filteredDevices, videoDevices, facingMode, chosenCamera) {
  // the user has chosen their own deviceID so return that
  // otherwise do the usual flow
  if (chosenCamera !== '') {
    return chosenCamera
  }
  if (filteredDevices.length > 0) {
    alert('if statement2');
    return filteredDevices[0].deviceId
  }
  if (videoDevices.length === 1 || facingMode === 'user') {
    alert('if statement3');
    return videoDevices[0].deviceId
  }
  alert('none of these lame ass ifs worked');
  return videoDevices[1].deviceId
}

const getFacingModePattern = facingMode =>
  facingMode === 'environment' ? /rear|back|environment/gi : /front|user|face/gi

function getDeviceId (facingMode, chosenCamera, chooseDeviceId = defaultDeviceIdChooser) {
  // Get manual deviceId from available devices.
  return new Promise((resolve, reject) => {
    let enumerateDevices
    try {
      enumerateDevices = navigator.mediaDevices.enumerateDevices()
    } catch (err) {
      reject(new NoVideoInputDevicesError())
    }
    enumerateDevices.then(devices => {
      // Filter out non-videoinputs
      const videoDevices = devices.filter(
        device => device.kind === 'videoinput'
      )

      if (videoDevices.length < 1) {
        reject(new NoVideoInputDevicesError())
        return
      }

      const pattern = getFacingModePattern(facingMode)
      // Filter out video devices without the pattern
      const filteredDevices = videoDevices.filter(({ label }) =>
        pattern.test(label)
      )

      resolve(chooseDeviceId(filteredDevices, videoDevices, facingMode, chosenCamera))
    })
  })
}

module.exports = { getDeviceId, getFacingModePattern }
