// Patita que aparece al sonreír y baja suavemente al relajar el rostro.
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
        const now = performance.now();
        const delta = this.lastTime ? Math.min((now - this.lastTime) / 1000, 0.05) : 1 / 30;
        this.lastTime = now;

        const target = smiling && detected && landmarks?.length > 454 ? 1 : 0;
        const smoothing = 1 - Math.exp(-delta * 9);
        this.progress += (target - this.progress) * smoothing;

        if (!this.image.complete || !this.image.naturalWidth || this.progress < 0.005) return;
        if (!landmarks || landmarks.length <= 454) return;

        const width = this.canvas.width;
        const height = this.canvas.height;
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];
        const chin = landmarks[152];

        const faceWidth = Math.abs(rightCheek.x - leftCheek.x) * width;
        const pawWidth = faceWidth * 0.72;
        const pawHeight = pawWidth * (this.image.naturalHeight / this.image.naturalWidth);
        const faceCenterX = ((leftCheek.x + rightCheek.x) / 2) * width;

        // La patita emerge junto a la parte inferior del rostro.
        const x = Math.max(0, Math.min(width - pawWidth, faceCenterX + faceWidth * 0.38 - pawWidth / 2));
        const raisedY = chin.y * height - pawHeight * 0.52;
        const loweredY = height + pawHeight * 0.08;
        const y = loweredY + (raisedY - loweredY) * this.progress;

        this.ctx.save();
        this.ctx.globalAlpha = Math.min(1, this.progress * 1.8);
        this.ctx.drawImage(this.image, x, y, pawWidth, pawHeight);
        this.ctx.restore();
    }
}
