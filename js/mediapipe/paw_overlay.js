// Una sola patita animada: se limpia el lienzo en cada frame para evitar rastros.
export default class PawOverlay {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.image = new Image();
        this.image.src = "./assets/patita-gato.webp";
        this.progress = 0;
        this.lastTime = 0;
    }

    draw(landmarks, smiling, detected) {
        const ctx = this.ctx;

        // Imprescindible: borrar el frame anterior antes de dibujar el actual.
        // Así nunca quedan copias de la patita durante el movimiento.
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.globalAlpha = 1;

        const now = performance.now();
        const delta = this.lastTime
            ? Math.min((now - this.lastTime) / 1000, 0.05)
            : 1 / 30;
        this.lastTime = now;

        const hasFace = detected && landmarks && landmarks.length > 454;
        const target = smiling && hasFace ? 1 : 0;

        // Interpolación suave al subir y al bajar.
        const smoothing = 1 - Math.exp(-delta * 9);
        this.progress += (target - this.progress) * smoothing;

        if (!hasFace || !this.image.complete || !this.image.naturalWidth || this.progress < 0.005) {
            return;
        }

        const width = this.canvas.width;
        const height = this.canvas.height;
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];
        const chin = landmarks[152];

        const faceWidth = Math.abs(rightCheek.x - leftCheek.x) * width;
        const pawWidth = faceWidth * 0.72;
        const pawHeight = pawWidth * (this.image.naturalHeight / this.image.naturalWidth);
        const faceCenterX = ((leftCheek.x + rightCheek.x) / 2) * width;

        const x = Math.max(
            0,
            Math.min(width - pawWidth, faceCenterX + faceWidth * 0.38 - pawWidth / 2)
        );

        const raisedY = chin.y * height - pawHeight * 0.52;
        const loweredY = height + pawHeight * 0.08;
        const y = loweredY + (raisedY - loweredY) * this.progress;

        ctx.save();
        ctx.globalAlpha = Math.min(1, this.progress * 1.8);
        ctx.drawImage(this.image, x, y, pawWidth, pawHeight);
        ctx.restore();
        ctx.globalAlpha = 1;
    }
}
