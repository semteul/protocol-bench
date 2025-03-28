const createBtn = document.getElementById('createBtn');
const answerBtn = document.getElementById('answerBtn');
const setAnswerBtn = document.getElementById('setAnswerBtn');
const offerTextarea = document.getElementById('offer');
const chatBox = document.getElementById('chat');
const messageInput = document.getElementById('messageInput');

let pc;
let dataChannel;

const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

function appendChat(text, sender = "상대 : ") {
  chatBox.value += `${sender} ${text}\n`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

createBtn.onclick = async () => {
  pc = new RTCPeerConnection(config);
  dataChannel = pc.createDataChannel("chat");

  setupDataChannel();

  pc.onicecandidate = event => {
    if (event.candidate === null) {
      offerTextarea.value = JSON.stringify(pc.localDescription);
    }
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
};

answerBtn.onclick = async () => {
  const offer = JSON.parse(offerTextarea.value);
  pc = new RTCPeerConnection(config);

  pc.ondatachannel = event => {
    dataChannel = event.channel;
    setupDataChannel();
  };

  pc.onicecandidate = event => {
    if (event.candidate === null) {
      offerTextarea.value = JSON.stringify(pc.localDescription);
    }
  };

  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
};

setAnswerBtn.onclick = async () => {
  const answer = JSON.parse(offerTextarea.value);
  await pc.setRemoteDescription(answer);
};

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && dataChannel && dataChannel.readyState === "open") {
    const msg = messageInput.value.trim();
    if (msg) {
      dataChannel.send(msg);
      appendChat(msg, "나 : ");
      messageInput.value = "";
    }
  }
});

function setupDataChannel() {
  dataChannel.onopen = () => {
    console.log("채널 연결됨");
  };

  dataChannel.onmessage = (event) => {
    appendChat(event.data, "상대 : ");
  };

  dataChannel.onerror = (e) => {
    console.error("DataChannel error:", e);
  };

  dataChannel.onclose = () => {
    console.log("채널 종료됨");
  };
}
