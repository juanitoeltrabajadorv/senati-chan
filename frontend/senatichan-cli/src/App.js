import { useState, useEffect } from "react";

function App() {
  const backendURL = "http://localhost:5000";

  const [threads, setThreads] = useState([]);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  // 🔹 Cargar threads al iniciar
  useEffect(() => {
    fetch(`${backendURL}/api/threads`)
      .then((res) => res.json())
      .then(setThreads)
      .catch((err) => setError(err.message));
  }, []);

  // 🔹 Crear nuevo thread
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let imageUrl = null;

    try {
      // 1️⃣ Si hay imagen, pedir URL de subida a backend
      if (image) {
        const res = await fetch(`${backendURL}/api/upload-url`);
        const data = await res.json();

        if (!data.uploadUrl || !data.key) {
          throw new Error("No se recibió URL de subida válida");
        }

        // 2️⃣ Subir la imagen directamente a S3
        const uploadRes = await fetch(data.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!uploadRes.ok) throw new Error("Error subiendo imagen a S3");

        // 3️⃣ Guardar URL pública
        imageUrl = `https://${process.env.REACT_APP_S3_BUCKET || "senatichan-uploads"}.s3.us-east-2.amazonaws.com/${data.key}`;
      }

      // 4️⃣ Enviar el post a la base de datos
      const response = await fetch(`${backendURL}/api/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, image_url: imageUrl }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Error creando thread");

      // 🔄 Recargar threads
      fetch(`${backendURL}/api/threads`)
        .then((res) => res.json())
        .then(setThreads);

      setTitle("");
      setContent("");
      setImage(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>SENATICHAN 🧠</h1>
      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <textarea
          placeholder="Contenido"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          style={{ marginBottom: 10 }}
        />

        <button type="submit" style={{ padding: "10px 20px" }}>
          Publicar
        </button>
      </form>

      {threads.map((t) => (
        <div key={t.id} style={{ marginBottom: 20, borderBottom: "1px solid #ccc" }}>
          <h3>{t.title}</h3>
          <p>{t.content}</p>
          {t.image_url && (
            <img
              src={t.image_url}
              alt="thread"
              style={{ maxWidth: "400px", borderRadius: 8 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
