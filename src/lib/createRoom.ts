		export const createRoom = () => {
    const r = "abcdefghijklmnopqrstuvwxyz0123456789";
    let newRoom = "";
    for (let i = 0; i < 8; i++) {
      newRoom += r[~~(Math.random() * r.length)];
    }
    return newRoom;
		}