import { GetStaticProps } from "next";
import Header from "../../components/header";
import { sanityClient, urlFor } from "../../sanity";
import { Post } from "../../typing";
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";

interface Props {
  post: Post;
}
interface IFormInput {
  _id: string;
  name: string;
  email: string;
  comment: string;
}

const Post = ({ post }: Props) => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    await fetch("/api/createComment", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((res) => {
        console.log(res);
        setSubmitted(true);
      })
      .catch((err) => {
        console.log(err);
        setSubmitted(false);
      });
  };
  return (
    <main>
      <Header />
      <img src={urlFor(post.mainImage).url()!} alt="banner" className="w-full h-40 object-cover" />
      <article className="max-w-3xl mx-auto p-5">
        <h1 className="text-3xl mt-10 mb-3">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500">{post.description}</h2>
        <div className="flex items-center space-x-2 mt-3">
          <img
            src={urlFor(post.author.image).url()!}
            alt="blog-image"
            className="h-10 w-10 rounded-full"
          />
          <p className="font-extralight text-sm">
            Blog post by <span className="text-green-600">{post.author.name}</span> - Published at{" "}
            {new Date(post._createdAt).toLocaleDateString()}
          </p>
        </div>
        <div>
          <PortableText
            content={post.body}
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            className=""
            serializers={{
              h1: (props: any) => <h1 className="text-2xl font-bold my-5" {...props} />,
              h2: (props: any) => <h2 className="text-xl font-bold my-5" {...props} />,
              li: (children: any) => <li className="ml-4 list-disc">{children}</li>,
              link: ({ href, children }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>
      <hr className="max-w-lg my-5 mx-auto border border-blue-700" />
      {submitted ? (
        <div className="flex flex-col p-10 my-10 bg-blue-700 text-white max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold">Thank your for submitting your comment!</h3>
          <p>Once approved, it will appear below</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col p-5 max-w-2xl mx-auto mb-10">
          <h3 className="text-sm text-blue-700">Enjoyed this article?</h3>
          <h4 className="text-3xl font-bold">Leave a comment below</h4>
          <hr className="py-3 mt-2" />

          <input type="hidden" {...register("_id")} name="_id" value={post._id} />
          <label htmlFor="" className="block mb-5">
            <span className="text-gray-700">Name</span>
            <input
              {...register("name", { required: true })}
              type="text"
              name="name"
              placeholder="John Appleseed"
              className="shadow border rounded py-2
          px-3 form-input mt-1 block w-full ring-blue-700 outline-none focus:ring"
            />
            {errors.name && <span className="text-red-500">The Name field is required</span>}
          </label>
          <label htmlFor="" className="block mb-5">
            <span className="text-gray-700">Email</span>
            <input
              {...register("email", { required: true })}
              type="email"
              name="email"
              placeholder="JohnAppleseed@email.com"
              className="shadow border rounded py-2
          px-3 form-input mt-1 block w-full ring-blue-700 outline-none focus:ring"
            />
            {errors.email && <span className="text-red-500">The Email field is required</span>}
          </label>
          <label htmlFor="" className="block mb-5">
            <span className="text-gray-700">Comment</span>
            <textarea
              {...register("comment", { required: true })}
              rows={8}
              name="comment"
              placeholder="type your comment here"
              className="shadow border rounded py-2 px-3
           form-textarea mt-1 w-full ring-blue-700 outline-none focus:ring"
            />
            {errors.comment && <span className="text-red-500">The Comment field is required</span>}
          </label>
          <input
            type="submit"
            className="shadow bg-blue-700 hover:bg-blue-900 
        foucs:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer"
          />
        </form>
      )}

      <div className="flex flex-col p-10 max-w-2xl mx-auto shadow space-y-2 shadow-blue-500">
        <h3 className="text-3xl">Comments</h3>
        <hr className="pb-2" />
        {post.comments.map((comment) => (
          <div key={comment._id}>
            <span>{comment.name}</span>: {comment.comment}
          </div>
        ))}
      </div>
      <div className="h-8" />
    </main>
  );
};

export default Post;

export const getStaticPaths = async () => {
  const query = `*[_type == 'post']{
    _id,
    slug{
        current
    }
  }`;
  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == 'post' && slug.current == $slug][0]{
    _id,
    title,
    slug,
    author->{
    name,
    image
  },
  'comments':*[
    _type=='comment' &&
    post._ref == ^._id &&
    approved== true],
  description,
  mainImage,
  body
  }`;

  const post = await sanityClient.fetch(query, {
    slug: params?.slug,
  });
  //   console.log({post})

  if (!post) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      post,
    },
    revalidate: 43200,
  };
};
