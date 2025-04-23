// pages/country/[id].js
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth, db, storage } from "@/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

const sampleData = {
  thailand: {
    name: "Thailand",
    capital: "Bangkok",
    visa: "30 days visa-free",
    prices: {
      meal: "$3",
      beer: "$1.50",
      taxi: "$0.50/km",
    },
    safety: "Safe for tourists with basic precautions",
    airport: "Suvarnabhumi (BKK)",
  },
  france: {
    name: "France",
    capital: "Paris",
    visa: "Schengen Visa Required",
    prices: {
      meal: "$15",
      beer: "$6",
      taxi: "$2/km",
    },
    safety: "Generally safe, beware of pickpockets",
    airport: "Charles de Gaulle (CDG)",
  },
};

export default function CountryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [media, setMedia] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const country = sampleData[id];

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, "comments"), where("countryId", "==", id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setComments(fetched);
    });

    const mediaQuery = query(collection(db, "media"), where("countryId", "==", id));
    const unsubscribeMedia = onSnapshot(mediaQuery, (snapshot) => {
      const fetchedMedia = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMediaList(fetchedMedia);
    });

    return () => {
      unsubscribe();
      unsubscribeMedia();
    };
  }, [id]);

  const handleUpload = async () => {
    if (media) {
      const mediaRef = ref(storage, `media/${id}/${media.name}`);
      await uploadBytes(mediaRef, media);
      const url = await getDownloadURL(mediaRef);
      await addDoc(collection(db, "media"), {
        countryId: id,
        url,
        created: Timestamp.now(),
      });
      setMedia(null);
    }
  };

  const handleAddComment = async () => {
    if (comment) {
      await addDoc(collection(db, "comments"), {
        countryId: id,
        text: comment,
        created: Timestamp.now(),
      });
      setComment("");
    }
  };

  const handleDeleteComment = async (commentId) => {
    await deleteDoc(doc(db, "comments", commentId));
  };

  const handleDeleteMedia = async (mediaId) => {
    await deleteDoc(doc(db, "media", mediaId));
  };

  if (!country) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{country.name}</h1>
      <Card className="mb-4">
        <CardContent>
          <p>Capital: {country.capital}</p>
          <p>Visa: {country.visa}</p>
          <p>Meal: {country.prices.meal}</p>
          <p>Beer: {country.prices.beer}</p>
          <p>Taxi: {country.prices.taxi}</p>
          <p>Safety: {country.safety}</p>
          <p>Airport: {country.airport}</p>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-lg font-semibold">Upload Media</h2>
        <input type="file" onChange={(e) => setMedia(e.target.files[0])} className="mb-2" />
        <Button onClick={handleUpload}>Upload</Button>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {mediaList.map((mediaItem, index) => (
            <div key={index} className="relative">
              <img
                src={mediaItem.url}
                alt="user upload"
                className="w-full max-h-48 object-cover rounded"
              />
              <button
                className="absolute top-1 right-1 bg-white text-red-600 text-xs px-1 rounded shadow"
                onClick={() => handleDeleteMedia(mediaItem.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold">Comments</h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment..."
          className="w-full border p-2 rounded mb-2"
        />
        <Button onClick={handleAddComment}>Post</Button>
        <ul className="mt-4 list-disc pl-5">
          {comments.map((c, i) => (
            <li key={i} className="flex items-center justify-between">
              {c.text}
              <button
                className="ml-2 text-xs text-red-600"
                onClick={() => handleDeleteComment(c.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Placeholder for Affiliate / Ad section */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Sponsored Links</h2>
        <p>[Affiliate ad goes here]</p>
      </div>
    </div>
  );
}
