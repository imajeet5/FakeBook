import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingDotsIcon from './LoadingDotsIcon';
import Post from './Post';

export default function ProfilePost() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { username } = useParams();

  useEffect(() => {
    const currentRequest = Axios.CancelToken.source();
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {
          cancelToken: currentRequest.token,
        });
        setPosts(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
    fetchPosts();
    return () => {
      currentRequest.cancel();
    };
  }, [username]);

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className="list-group">
      {posts.map((post) => (
        <Post post={post} key={post._id} noAuthor/>
      ))}
    </div>
  );
}
