import { Link } from 'react-router-dom';

const ErrorPage = ({
  code = '404',
  title = 'Page not found',
  message = "Sorry, we couldn't find the page you're looking for.",
}) => {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-gray-900 px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-indigo-400">{code}</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
          {title}
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
          {message}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/home"
            className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Go back home
          </Link>
          <Link to="/contact-us" className="text-sm font-semibold text-white">
            Contact support <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ErrorPage;
