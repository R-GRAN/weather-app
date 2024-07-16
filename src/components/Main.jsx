import { useState } from "react";
import axios from "axios";

function Main() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [pics, setPics] = useState(null);

  //Récupere une image d'après la ville recherchée et son pays
  async function getPixabayPicture(city, country) {
    axios
      .get("https://pixabay.com/api/", {
        params: {
          key: import.meta.env.VITE_PIXABAY_KEY,
          q: `${city}, ${country}`,
          image_type: "photo", // vous pouvez spécifier le type d'image que vous recherchez
          // d'autres paramètres optionnels peuvent être ajoutés selon les besoins
        },
      })
      .then((response) => {
        // Gérer la réponse de l'API ici
        console.log("Réponse de Pixabay:", response.data);

        // Exemple: récupérer l'URL de l'image
        const imageURL = response.data.hits[0].largeImageURL; // ajustez en fonction de la structure de la réponse
        // console.log("URL de l'image:", imageURL);
        setPics(imageURL);
      })
      .catch((error) => {
        // Gérer les erreurs ici
        console.error("Erreur lors de la requête API:", error);
      });
  }

  //Traduit la texte de la condition météorologique de l'anglais au français
  async function translateWeather(text) {
    const options = {
      method: "POST",
      url: "https://deep-translate1.p.rapidapi.com/language/translate/v2",
      headers: {
        "x-rapidapi-key": import.meta.env.VITE_RAPID_API_KEY,
        "x-rapidapi-host": "deep-translate1.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      data: {
        q: text,
        source: "en",
        target: "fr",
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data);

      const translatedText = response.data.data.translations.translatedText;
      return translatedText;
    } catch (error) {
      console.error(error);
    }
  }

  //Récupere les informations météorologiques d'après la ville recherchée
  async function getWeather(city) {
    const options = {
      method: "GET",
      url: "https://weatherapi-com.p.rapidapi.com/current.json",
      params: { q: city },
      headers: {
        "x-rapidapi-key": import.meta.env.VITE_RAPID_API_KEY,
        "x-rapidapi-host": "weatherapi-com.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      console.log(response.data);

      getPixabayPicture(
        response.data.location.name,
        response.data.location.country
      );

      response.data.current.condition.text = await translateWeather(
        response.data.current.condition.text
      );
      setWeather(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
      setWeather(null);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    getWeather(city);
  }

  return (
    <main>
      <form className="" method="get" onSubmit={(evt) => handleSubmit(evt)}>
        <label htmlFor="search"></label>
        <input
          className="border-solid border-black border-2 m-2 p-2"
          type="search"
          name="search"
          id="search"
          onChange={(evt) => setCity(evt.target.value)}
        />
        <button className="bg-blue-400 text-white p-2 rounded-md cursor-pointer">
          Rechercher
        </button>
      </form>

      {weather != null && (
        <div>
          <h2 className="font-extrabold text-3xl p-4">
            {weather.location.name}, {weather.location.country}
          </h2>
          <img
            className="w-[50%] m-auto p-2"
            src={pics}
            alt={"photo de " + weather.location.name}
          />
          <h3>{weather.current.condition.text}</h3>
          <p>🌡️ Température : {weather.current.temp_c}°C</p>
          <p>💧 humidité : {weather.current.humidity}%</p>
        </div>
      )}
    </main>
  );
}

export default Main;
