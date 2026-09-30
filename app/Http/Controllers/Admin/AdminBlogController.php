<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminBlogController extends Controller
{
    public function posts()
    {
        $posts = \Illuminate\Support\Facades\DB::table('blog_posts')
            ->leftJoin('blog_categories', 'blog_posts.category_id', '=', 'blog_categories.id')
            ->select('blog_posts.id', 'blog_posts.title', 'blog_categories.name as category', 'blog_posts.is_published as status', 'blog_posts.created_at as date')
            // 'views' column is not in supabase migration by default so we omit it for now or default 0
            ->get()
            ->map(function ($post) {
                $post->status = $post->status ? 'Published' : 'Draft';
                $post->views = 0;
                $post->date = \Carbon\Carbon::parse($post->date)->format('Y-m-d');
                return (array) $post;
            });

        return Inertia::render('Admin/Blog/Posts', ['posts' => $posts, 'categories' => \Illuminate\Support\Facades\DB::table('blog_categories')->get()]);
    }

    public function storePost(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:blog_posts',
            'category_id' => 'nullable|exists:blog_categories,id',
            'content' => 'nullable|string',
            'is_published' => 'boolean'
        ]);
        
        $validated['author_id'] = auth()->id();
        \App\Models\BlogPost::create($validated);

        return redirect()->back()->with('success', 'Post created successfully.');
    }

    public function updatePost(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:blog_posts,slug,' . $id,
            'category_id' => 'nullable|exists:blog_categories,id',
            'content' => 'nullable|string',
            'is_published' => 'boolean'
        ]);

        \App\Models\BlogPost::findOrFail($id)->update($validated);

        return redirect()->back()->with('success', 'Post updated successfully.');
    }

    public function destroyPost($id)
    {
        \App\Models\BlogPost::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Post deleted successfully.');
    }

    public function categories()
    {
        $categories = \Illuminate\Support\Facades\DB::table('blog_categories')
            ->leftJoin('blog_posts', 'blog_categories.id', '=', 'blog_posts.category_id')
            ->select('blog_categories.id', 'blog_categories.name', 'blog_categories.slug', \Illuminate\Support\Facades\DB::raw('COUNT(blog_posts.id) as post_count'))
            ->groupBy('blog_categories.id', 'blog_categories.name', 'blog_categories.slug')
            ->get();

        return Inertia::render('Admin/Blog/Categories', ['categories' => $categories]);
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:blog_categories',
        ]);
        
        \App\Models\BlogCategory::create($validated);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function updateCategory(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:blog_categories,slug,' . $id,
        ]);

        \App\Models\BlogCategory::findOrFail($id)->update($validated);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroyCategory($id)
    {
        \App\Models\BlogCategory::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Category deleted successfully.');
    }

    public function tags()
    {
        $tags = \Illuminate\Support\Facades\DB::table('blog_tags')
            ->select('id', 'name', 'slug')
            ->get();

        return Inertia::render('Admin/Blog/Tags', ['tags' => $tags]);
    }

    public function storeTag(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:blog_tags',
        ]);
        
        \App\Models\BlogTag::create($validated);

        return redirect()->back()->with('success', 'Tag created successfully.');
    }

    public function updateTag(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:blog_tags,slug,' . $id,
        ]);

        \App\Models\BlogTag::findOrFail($id)->update($validated);

        return redirect()->back()->with('success', 'Tag updated successfully.');
    }

    public function destroyTag($id)
    {
        \App\Models\BlogTag::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Tag deleted successfully.');
    }

    public function comments()
    {
        $comments = \Illuminate\Support\Facades\DB::table('blog_comments')
            ->leftJoin('blog_posts', 'blog_comments.post_id', '=', 'blog_posts.id')
            ->select('blog_comments.id', 'blog_posts.title as post_title', 'blog_comments.author_name as author', 'blog_comments.body as content', 'blog_comments.is_approved as status', 'blog_comments.created_at as date')
            ->get()
            ->map(function ($comment) {
                $comment->status = $comment->status ? 'Approved' : 'Pending';
                $comment->date = \Carbon\Carbon::parse($comment->date)->format('Y-m-d');
                return (array) $comment;
            });

        return Inertia::render('Admin/Blog/Comments', ['comments' => $comments]);
    }

    public function toggleCommentStatus($id)
    {
        $comment = \App\Models\BlogComment::findOrFail($id);
        $comment->update(['is_approved' => !$comment->is_approved]);

        return redirect()->back()->with('success', 'Comment status updated.');
    }

    public function destroyComment($id)
    {
        \App\Models\BlogComment::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Comment deleted successfully.');
    }
}
