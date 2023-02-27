const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const cursor = document.querySelector("#cursor");

const colorInput = document.querySelector("#color");
const colorValue = document.querySelector("#color-value");
const sizeInput = document.querySelector("#size");
const sizeValue = document.querySelector("#size-value");
const txtSizeInput = document.querySelector("#txt-size");
const txtSizeValue = document.querySelector("#txt-size-value");
const txtFont = document.querySelector("#txt-font");
const txtKind = document.getElementsByName("txt-kind");
let textFont;
let textFill = true;

const colorPalette = document.querySelectorAll(".color-list");

const mode = document.getElementsByName("mode");
const reset = document.querySelector("#reset-btn");
const save = document.querySelector("#save-btn");
const fileInput = document.querySelector("#file");
const textInput = document.querySelector("#text");
const txt = document.querySelector("#txt-btn");

const clearDialog = document.querySelector("#clear-dialog");
const txtDialog = document.querySelector("#txt-dialog");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 60;

ctx.lineCap = "round";

ctx.lineWidth = 30;
cursor.style.width = `${ctx.lineWidth}px`;
cursor.style.height = `${ctx.lineWidth}px`;
sizeInput.value = ctx.lineWidth;

// fillRect = fill+Rect = fill + (moveTo+lineTo)

// moveTo 선을 긋지 않으면서 연필위치 이동
// lineTo 선을 그으면서 연필위치 이동
// style(lineWidth, fillStyle, strokeStyle) 그리기 메소드 전에 선언
// beginPath 다른 style 적용할 때
// fill, stroke 마지막에 선언 후 그려짐

let isPainting = false;

let lassoMode = false;
let fillMode = false;
let eraserMode = false;

colorValue.textContent = colorInput.value;
sizeValue.textContent = sizeInput.value;
txtSizeValue.textContent = `${txtSizeInput.value}px`;

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
      ctx.strokeStyle = colorValue.textContent;
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
}

function colorChange(event) {
  const thisColor = event.target.value;

  colorValue.textContent = thisColor;
  ctx.strokeStyle = thisColor;
  ctx.fillStyle = thisColor;
  cursor.style.backgroundColor = thisColor;
}

function sizeChange(event) {
  const thisSize = event.target.value;

  sizeValue.textContent = thisSize;
  ctx.lineWidth = thisSize;
  cursor.style.width = `${thisSize}px`;
  cursor.style.height = `${thisSize}px`;
}

function colorPaletteOnClick(event) {
  const thisColor = event.target.dataset.color;

  colorValue.textContent = thisColor;
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
    return (
      (ctx.strokeStyle = colorValue.textContent),
      (ctx.fillStyle = colorValue.textContent)
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
  };
}

function txtSizeChange(event) {
  const thisSize = event.target.value;
  txtSizeValue.textContent = `${thisSize}px`;
}

function txtFontChange(event) {
  const thisFont = event.target[txtFont.selectedIndex].value;
  textFont = thisFont;
}

function onDoubleClick(event) {
  const thisText = textInput.value;
  if (thisText !== "") {
    ctx.save();
    ctx.font = `${txtSizeInput.value}px ${textFont}`;
    ctx.lineWidth = 1;
    if (textFill) {
      ctx.fillText(thisText, event.offsetX, event.offsetY);
    } else {
      ctx.strokeText(thisText, event.offsetX, event.offsetY);
    }
    ctx.restore();
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
canvas.addEventListener("mouseleave", cancelPainting);
canvas.addEventListener("dblclick", onDoubleClick);

colorInput.addEventListener("input", colorChange);
sizeInput.addEventListener("input", sizeChange);
txtSizeInput.addEventListener("input", txtSizeChange);

colorPalette.forEach((thisColor) =>
  thisColor.addEventListener("click", colorPaletteOnClick)
);

mode.forEach((thisMode) => {
  thisMode.addEventListener("input", modeChange);
  thisMode.addEventListener("click", () => {
    mode.forEach((el) => el.classList.remove("active"));
    thisMode.classList.add("active");
  });
});

txtKind.forEach((thisTxt) => {
  thisTxt.addEventListener("click", () => {
    txtKind.forEach((el) => el.classList.remove("active"));
    thisTxt.classList.add("active");
    if (thisTxt.value !== "Fill") {
      textFill = false;
    } else {
      textFill = true;
    }
  });
});

reset.addEventListener("click", () => {
  clearDialog.showModal();
});
clearDialog.addEventListener("close", resetCanvas);
txt.addEventListener("click", () => {
  txtDialog.showModal();
});
save.addEventListener("click", onSave);

fileInput.addEventListener("input", onFileChange);

txtFont.addEventListener("input", txtFontChange);

// window.addEventListener("resize", () => {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight - 60;

//   ctx.lineCap = "round";

//   ctx.lineWidth = 30;
//   cursor.style.width = `${ctx.lineWidth}px`;
//   cursor.style.height = `${ctx.lineWidth}px`;
//   sizeInput.value = ctx.lineWidth;
// });
