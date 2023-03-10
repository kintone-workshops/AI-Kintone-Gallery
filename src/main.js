import './style.css';
import generateImages from './requests/aiPOSTRequest';
import updateKintone from './requests/kintonePUTRequest';

(function () {
  'use strict';

  kintone.events.on('app.record.detail.show', function (event) {

    //b64→Blob形式変換用Func
    const b64toBlob = (base64, type = 'data:image/png;base64') =>
      fetch(`data:${type};base64,${base64}`).then(res => res.blob())

    //AI APIに投げるテキスト
    const promptBuilder = () => {
      let promptString = `A ${event.record.animal.value} who looks ${event.record.emotion.value} holding a ${event.record.random.value} wearing `;

      let clothesArray = event.record.clothes.value;
      clothesArray.forEach((option, index) => {
        if (index == 0) {
          promptString += `${option}`;
        } else {
          promptString = promptString + ` and ${option}`;
        }
      });
      return promptString
    }

    //AI API用
    const postBody = {
      prompt: promptBuilder(),
      n: 1,
      size: "512x512",
      response_format: "b64_json"
    }

    // Create a button for our AI API call
    const generateButton = document.createElement('button');
    //TODO
    generateButton.id = 'generateButton'; // Our "Element ID" from our Blank Space in the Kintone App.
    // Give it an id & class (for CSS), and text on the button.
    generateButton.className = "uploadButton"
    generateButton.innerHTML = 'Generate Images!';

    // Run a function when the button is clicked
    generateButton.onclick = () => {
      // We need to call our API POST function with request's body... 🧐
      generateImages(postBody).then(async (result) => {
        let imageCreatedDateTime = new Date(result.created * 1000);
        let imageBlob = await b64toBlob(result.data[0].b64_json)
        let file = new File([imageBlob], "test.png", {type: 'image/png', lastModified: imageCreatedDateTime})
        console.log(imageCreatedDateTime);
        console.log(event.appId);
        console.log(file)
        updateKintone(event.recordId, file, imageCreatedDateTime)
      })
    };
    // Set button on the Blank Space field
    kintone.app.record.getSpaceElement('generateButton').appendChild(generateButton);
  });
})();