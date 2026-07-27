import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config";

const progressMessages = [
  "📄 Uploading your paper...",
  "🔍 Reading your paper...",
  "📝 Understanding your answers...",
  "🧠 Identifying weak topics...",
  "📊 Preparing your personalized report..."
];

const UploadSection = ({ onAnalysisComplete }) => {

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);

  const [progressStep, setProgressStep] = useState(0);

  const [error, setError] = useState("");

  const [dragging, setDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {

    if (!image) {

      setPreview("");

      return;

    }

    const objectUrl = URL.createObjectURL(image);
    const reader = new FileReader();

    reader.onload = () => {

      sessionStorage.setItem(
        "uploadedImage",
        reader.result
      );

    };

    reader.readAsDataURL(image);

    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);

  }, [image]);

  useEffect(() => {

    const img = sessionStorage.getItem(
      "uploadedImage"
    );

    if (img) {

      setPreview(img);

    }

  }, []);

  const handleImageSelect = (file) => {

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      setError("Please upload an image only.");

      return;

    }

    setError("");

    setImage(file);

  };

  const handleDrop = (e) => {

    e.preventDefault();

    setDragging(false);

    if (!e.dataTransfer.files.length) return;

    handleImageSelect(e.dataTransfer.files[0]);

  };

  const handleAnalyze = async () => {

    if (!image) {

      setError("Please select an image.");

      return;

    }

    setLoading(true);

    setProgressStep(0);

    let timer;

    try {

      timer = setInterval(() => {

        setProgressStep((prev) => {

          if (prev >= progressMessages.length - 1)
            return prev;

          return prev + 1;

        });

      }, 1700);

      const formData = new FormData();

      formData.append("image", image);

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.token;

      const response = await axios.post(

        `${API_URL}/api/ai/analyze`,

        formData,

        {

          headers: {

            Authorization: `Bearer ${token}`,

            "Content-Type": "multipart/form-data"

          }

        }

      );
      console.log(response.data);

      onAnalysisComplete(response.data);

    }

    catch (err) {

      console.log(err);

      setError("AI Analysis Failed.");

    }

    finally {

      clearInterval(timer);

      setLoading(false);

    }

  };

  return (

    <>
      {loading && (
        <div className="loader-overlay">

          <div className="loader-box">

            <div className="spinner"></div>

            <h2>AI Assistant</h2>

            <p>{progressMessages[progressStep]}</p>

          </div>

        </div>
      )}

      <div className="upload-card">

        <h2>Upload Exam Paper</h2>

        <p>
          Upload your MCQ answer sheet to start AI-powered analysis.
        </p>

        <label
          htmlFor="upload-image"
          className={`drop-zone ${dragging ? "dragging" : ""}`}

          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}

          onDragLeave={() => setDragging(false)}

          onDrop={handleDrop}
        >

          {/* {
            preview ? (

              <img
                src={preview}
                alt="Preview"
                className="preview-image"
              />

            ) : (

              <>

                <div className="upload-icon">

                  📄

                </div>

                <h3>Drag & Drop Image Here</h3>

                <p>or</p>

              </>

            )
          } */}
          {
            preview ? (

              <div className="preview-wrapper">

                <img
                  src={preview}
                  alt="Preview"
                  className="preview-thumb"
                  onClick={() => setShowPreview(true)}
                />

                <div className="preview-actions">

                  <label
                    htmlFor="upload-image"
                    className="browse-btn"
                  >
                    Change Image
                  </label>

                  <button
                    className="remove-btn"
                    onClick={() => {

                      setImage(null);

                      setPreview("");

                      setShowPreview(false);

                      sessionStorage.removeItem("uploadedImage");

                    }}
                  >
                    Remove
                  </button>

                </div>

              </div>

            ) : (

              <>

                <div className="upload-icon">
                  📄
                </div>

                <h3>Drag & Drop Image Here</h3>

                <p>or</p>
                <p className="browse-text">
                  Click anywhere to browse image
                </p>
                {/* <label
                  htmlFor="upload-image"
                  className="browse-btn"
                >
                  Browse Image
                </label> */}

              </>

            )
          }

          <input
            type="file"
            accept="image/*"
            id="upload-image"
            hidden
            onChange={(e) => handleImageSelect(e.target.files[0])}
          />

          {/* <label
            htmlFor="upload-image"
            className="browse-btn"
          >
            Browse Image
          </label> */}

        </label>

        {
          image && (

            <div className="selected-file">

              <strong>Selected File</strong>

              <p>{image.name}</p>

            </div>

          )
        }

        {
          error && (

            <div className="upload-error">

              {error}

            </div>

          )
        }

        <button

          className="analyze-btn"

          onClick={handleAnalyze}

          disabled={loading}

        >

          {

            loading

              ? "Analyzing..."

              : "Analyze Paper"

          }

        </button>
        {
          showPreview && (

            <div
              className="image-modal"
              onClick={() => setShowPreview(false)}
            >

              <div
                className="image-modal-content"
                onClick={(e) => e.stopPropagation()}
              >

                <button
                  className="close-preview"
                  onClick={() => setShowPreview(false)}
                >
                  ✕
                </button>

                <img
                  src={preview}
                  alt=""
                />

              </div>

            </div>

          )
        }
      </div >    </>


  );


};

export default UploadSection;