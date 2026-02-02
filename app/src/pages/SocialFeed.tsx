import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Image as ImageIcon,
  Send,
  MoreHorizontal,
  Smile,
  Bookmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getFullName } from '@/types';
import { toast } from 'sonner';
import type { Post, Comment } from '@/types';

const mockPosts: Post[] = [
  {
    id: '1',
    content: 'Happy Diwali everyone! Wishing you all a prosperous and joyful celebration. 🪔✨ May this festival of lights bring happiness and prosperity to all our families!',
    authorId: '1',
    authorName: 'John Doe',
    authorPhotoUrl: '',
    societyId: '1',
    likesCount: 24,
    commentsCount: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    content: 'The new gym equipment has been installed in the clubhouse. Check it out! 💪 The equipment includes treadmills, weights, and yoga mats. Open from 6 AM to 10 PM.',
    authorId: '2',
    authorName: 'Jane Smith',
    authorPhotoUrl: '',
    societyId: '1',
    likesCount: 18,
    commentsCount: 3,
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    content: 'Reminder: Water supply will be interrupted tomorrow from 10 AM to 2 PM for maintenance work. Please store sufficient water in advance. 🚰',
    authorId: '3',
    authorName: 'Admin',
    authorPhotoUrl: '',
    societyId: '1',
    likesCount: 12,
    commentsCount: 8,
    isActive: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const mockComments: Comment[] = [
  {
    id: '1',
    postId: '1',
    userId: '2',
    userName: 'Jane Smith',
    userPhotoUrl: '',
    content: 'Happy Diwali to you too! 🎉',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    postId: '1',
    userId: '3',
    userName: 'Mike Worker',
    userPhotoUrl: '',
    content: 'Wishing everyone a wonderful celebration! ✨',
    isActive: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export default function SocialFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newPost, setNewPost] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Math.random().toString(36).substr(2, 9),
      content: newPost,
      authorId: user?.id || '',
      authorName: user ? getFullName(user) : 'Anonymous',
      authorPhotoUrl: user?.profilePhotoUrl || '',
      societyId: user?.societyId || '',
      likesCount: 0,
      commentsCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPosts([post, ...posts]);
    setNewPost('');
    toast.success('Post created successfully');
  };

  const handleLike = (postId: string) => {
    const isLiked = likedPosts.has(postId);
    
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1 } 
        : p
    ));
    
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleAddComment = (postId: string) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      postId,
      userId: user?.id || '',
      userName: user ? getFullName(user) : 'Anonymous',
      userPhotoUrl: user?.profilePhotoUrl || '',
      content,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setComments([...comments, comment]);
    setPosts(posts.map(p => 
      p.id === postId 
        ? { ...p, commentsCount: p.commentsCount + 1 } 
        : p
    ));
    setCommentInputs({ ...commentInputs, [postId]: '' });
    toast.success('Comment added');
  };

  const toggleComments = (postId: string) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Community Feed</h1>
            <p className="text-muted-foreground mt-1">
              Connect with your neighbors and stay updated
            </p>
          </div>

          {/* Create Post */}
          <Card className="mb-6 hover:shadow-3d transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                  <AvatarImage src={user?.profilePhotoUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="resize-none border-0 focus-visible:ring-0 p-0 min-h-[80px]"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                        <ImageIcon className="h-4 w-4" />
                        Photo
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                        <Smile className="h-4 w-4" />
                        Feeling
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={handleCreatePost}
                      disabled={!newPost.trim()}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <AnimatePresence mode="popLayout">
            <div className="space-y-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-3d transition-shadow">
                    <CardContent className="p-4">
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                            <AvatarImage src={post.authorPhotoUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {post.authorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{post.authorName}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(post.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Post Content */}
                      <p className="mb-4 leading-relaxed">{post.content}</p>

                      {/* Post Actions */}
                      <div className="flex items-center gap-1 pt-4 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`gap-2 flex-1 justify-center ${likedPosts.has(post.id) ? 'text-red-500' : ''}`}
                          onClick={() => handleLike(post.id)}
                        >
                          <Heart className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                          {post.likesCount}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2 flex-1 justify-center"
                          onClick={() => toggleComments(post.id)}
                        >
                          <MessageCircle className="h-4 w-4" />
                          {post.commentsCount}
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-2 flex-1 justify-center">
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Comments Section */}
                      <AnimatePresence>
                        {showComments[post.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-4 pt-4 border-t overflow-hidden"
                          >
                            <div className="space-y-4">
                              {comments
                                .filter(c => c.postId === post.id)
                                .map((comment) => (
                                  <div key={comment.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage src={comment.userPhotoUrl} />
                                      <AvatarFallback className="bg-muted text-xs">
                                        {comment.userName.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-muted p-3 rounded-2xl rounded-tl-none">
                                      <p className="font-medium text-sm">{comment.userName}</p>
                                      <p className="text-sm">{comment.content}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {formatTime(comment.createdAt)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              
                              {/* Add Comment */}
                              <div className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user?.profilePhotoUrl} />
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex gap-2">
                                  <Input
                                    placeholder="Write a comment..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                                    className="flex-1"
                                  />
                                  <Button 
                                    size="icon" 
                                    onClick={() => handleAddComment(post.id)}
                                    disabled={!commentInputs[post.id]?.trim()}
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {posts.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No posts yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to share something with your community
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
