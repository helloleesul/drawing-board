// fillRect = fill+Rect = fill + (moveTo+lineTo)

// moveTo 선을 긋지 않으면서 연필위치 이동
// lineTo 선을 그으면서 연필위치 이동
// style(lineWidth, fillStyle, strokeStyle) 그리기 메소드 전에 선언
// beginPath 다른 style 적용할 때
// fill, stroke 마지막에 선언 후 그려짐

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const stepPushArr = new Array();
let stepNumber = -1;

const cursor = document.querySelector("#cursor");

const colorInput = document.querySelector("#color");
const colorOutput = document.querySelector("#color-output");
const colorList = document.querySelectorAll(".color-list");

const sizeInput = document.querySelector("#size");
const sizeOutput = document.querySelector("#size-output");

const txtInput = document.querySelector("#txt");
const txtSizeInput = document.querySelector("#txt-size");
const txtSizeOutput = document.querySelector("#txt-size-output");
const txtFont = document.querySelector("#txt-font");
const txtKind = document.getElementsByName("txt-kind");
let selectFont;
let isTxtFill = true;

const modeList = document.getElementsByName("mode");
const clearBtn = document.querySelector("#clear-btn");
const saveBtn = document.querySelector("#save-btn");
const undoBtn = document.querySelector("#undo-btn");
const redoBtn = document.querySelector("#redo-btn");
const imageBtn = document.querySelector("#image");
const txtBtn = document.querySelector("#txt-btn");
let isPainting = false;
let lassoMode = false;
let fillMode = false;
let eraserMode = false;

const clearDialog = document.querySelector("#clear-dialog");
const txtDialog = document.querySelector("#txt-dialog");

function onLoad() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 60;

  ctx.lineCap = "round";
  ctx.lineWidth = 30;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  stepPush();

  cursor.style.width = `${ctx.lineWidth}px`;
  cursor.style.height = `${ctx.lineWidth}px`;

  sizeInput.value = ctx.lineWidth;
  colorOutput.textContent = colorInput.value;
  sizeOutput.textContent = sizeInput.value;
  txtSizeOutput.textContent = `${txtSizeInput.value}px`;
  ctx.fillStyle = colorInput.value;
}

function stepPush() {
  stepNumber++;
  if (stepNumber < stepPushArr.length) {
    stepPushArr.length = stepNumber;
  }
  stepPushArr.push(canvas.toDataURL());
}

function stepUndo() {
  if (stepNumber > 0) {
    stepNumber--;
    const thisCanvas = new Image();
    thisCanvas.src = stepPushArr[stepNumber];

    thisCanvas.onload = function () {
      ctx.drawImage(thisCanvas, 0, 0, canvas.width, canvas.height);
    };
  }
}

function stepRedo() {
  if (stepNumber < stepPushArr.length - 1) {
    stepNumber++;
    const thisCanvas = new Image();
    thisCanvas.src = stepPushArr[stepNumber];

    thisCanvas.onload = function () {
      ctx.drawImage(thisCanvas, 0, 0, canvas.width, canvas.height);
    };
  }
}

function onMove(event) {
  cursor.style.opacity = 1;
  cursor.style.left = `${event.clientX - cursor.clientWidth / 2}px`;
  cursor.style.top = `${event.clientY - cursor.clientHeight / 2}px`;

  if (isPainting) {
    ctx.lineTo(event.offsetX, event.offsetY);

    if (lassoMode) {
      ctx.fill();
    }
    if (fillMode) {
      onFillMode();
    }
    if (eraserMode) {
      ctx.strokeStyle = "white";
    } else {
      ctx.strokeStyle = colorOutput.textContent;
    }

    ctx.stroke();
    return;
  }
  ctx.moveTo(event.offsetX, event.offsetY);
}

function onFillMode() {
  if (fillMode) {
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else return;
}

function startPainting() {
  isPainting = true;
}
function cancelPainting() {
  isPainting = false;
  ctx.beginPath();
  return stepPush();
}
function cancelPainting2() {
  isPainting = false;
  ctx.beginPath();
}

function colorChange(event) {
  const thisColor = event.target.value;

  colorOutput.textContent = thisColor;
  ctx.strokeStyle = thisColor;
  ctx.fillStyle = thisColor;
  cursor.style.backgroundColor = thisColor;
}

function sizeChange(event) {
  const thisSize = event.target.value;

  sizeOutput.textContent = thisSize;
  ctx.lineWidth = thisSize;
  cursor.style.width = `${thisSize}px`;
  cursor.style.height = `${thisSize}px`;
}

function colorPaletteOnClick(event) {
  const thisColor = event.target.dataset.color;

  colorOutput.textContent = thisColor;
  colorInput.value = thisColor;
  ctx.strokeStyle = thisColor;
  ctx.fillStyle = thisColor;
  cursor.style.backgroundColor = thisColor;
}

function modeChange(event) {
  const thisMode = event.target.value;
  lassoMode = false;
  fillMode = false;
  eraserMode = false;

  if (thisMode === "Lasso") {
    lassoMode = true;
  } else if (thisMode === "Fill") {
    fillMode = true;
  } else if (thisMode === "Eraser") {
    eraserMode = true;
  }
}

function resetCanvas() {
  if (clearDialog.returnValue === "confirm") {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    stepPush();
    return (
      (ctx.strokeStyle = colorOutput.textContent),
      (ctx.fillStyle = colorOutput.textContent)
    );
  }
}

function onFileChange(event) {
  const thisFile = event.target.files[0];
  // 브라우저가 자신의 메모리에 있는 파일을 드러내는 방식
  const url = URL.createObjectURL(thisFile);
  const newImg = new Image();
  newImg.src = url;

  newImg.onload = function () {
    let scale_factor = Math.min(
      canvas.width / newImg.width,
      canvas.height / newImg.height
    );

    let newWidth = newImg.width * scale_factor;
    let newHeight = newImg.height * scale_factor;

    let x = canvas.width / 2 - newWidth / 2;
    let y = canvas.height / 2 - newHeight / 2;

    ctx.drawImage(newImg, x, y, newWidth, newHeight);
    stepPush();
  };
}

function txtSizeChange(event) {
  const thisSize = event.target.value;
  txtSizeOutput.textContent = `${thisSize}px`;
}

function txtFontChange(event) {
  const thisFont = event.target[txtFont.selectedIndex].value;
  selectFont = thisFont;
}

function onDoubleClick(event) {
  const thisText = txtInput.value;
  if (thisText !== "") {
    ctx.save();
    ctx.font = `${txtSizeInput.value}px ${selectFont}`;
    ctx.lineWidth = 1;
    ctx.fillStyle = colorInput.value;
    if (isTxtFill) {
      ctx.fillText(thisText, event.offsetX, event.offsetY);
    } else {
      ctx.strokeText(thisText, event.offsetX, event.offsetY);
    }
    ctx.restore();
    stepPush();
  }
}

function onSave() {
  const url = canvas.toDataURL();
  const saveImg = document.createElement("a");
  saveImg.href = url;
  saveImg.download = "내 그림.png";
  saveImg.click();
}

canvas.addEventListener("mousemove", onMove);
canvas.addEventListener("click", onFillMode);
canvas.addEventListener("mousedown", startPainting);
canvas.addEventListener("mouseup", cancelPainting);
canvas.addEventListener("mouseleave", cancelPainting2);
canvas.addEventListener("dblclick", onDoubleClick);

colorInput.addEventListener("input", colorChange);
sizeInput.addEventListener("input", sizeChange);
txtSizeInput.addEventListener("input", txtSizeChange);

colorList.forEach((thisColor) =>
  thisColor.addEventListener("click", colorPaletteOnClick)
);

modeList.forEach((thisMode) => {
  thisMode.addEventListener("input", modeChange);
  thisMode.addEventListener("click", () => {
    modeList.forEach((el) => el.classList.remove("active"));
    thisMode.classList.add("active");
  });
});

txtKind.forEach((thisTxt) => {
  thisTxt.addEventListener("click", () => {
    txtKind.forEach((el) => el.classList.remove("active"));
    thisTxt.classList.add("active");
    if (thisTxt.value !== "Fill") {
      isTxtFill = false;
    } else {
      isTxtFill = true;
    }
  });
});

clearBtn.addEventListener("click", () => {
  clearDialog.showModal();
});
clearDialog.addEventListener("close", resetCanvas);
txtBtn.addEventListener("click", () => {
  txtDialog.showModal();
});
saveBtn.addEventListener("click", onSave);

imageBtn.addEventListener("input", onFileChange);

txtFont.addEventListener("input", txtFontChange);

undoBtn.addEventListener("click", stepUndo);
redoBtn.addEventListener("click", stepRedo);
document.addEventListener("keydown", (event) => {
  const ctrl = event.ctrlKey || event.metaKey;
  const shift = event.shiftKey;
  const z = event.key === "z";

  if (ctrl && shift && z) {
    stepRedo();
    return;
  }
  if (ctrl && z) {
    stepUndo();
  }
});

window.addEventListener("load", onLoad);
