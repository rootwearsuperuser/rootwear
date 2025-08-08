// app/contact/page.js
import TransitionWrapper from '../components/TransitionWrapper';

export default function ContactPage() {
  return (
    <TransitionWrapper>
      <div className="min-h-screen px-6 py-16 bg-black text-green-300 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-green-400 mb-10 text-center">Contact RootWear</h1>

        <form className="w-full max-w-xl space-y-6">
          <div>
            <label htmlFor="name" className="block mb-2 text-green-400">Name</label>
            <input type="text" id="name" className="w-full px-4 py-2 bg-black border border-green-500 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div>
            <label htmlFor="email" className="block mb-2 text-green-400">Email</label>
            <input type="email" id="email" className="w-full px-4 py-2 bg-black border border-green-500 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div>
            <label htmlFor="message" className="block mb-2 text-green-400">Message</label>
            <textarea id="message" rows="5" className="w-full px-4 py-2 bg-black border border-green-500 text-green-300 focus:outline-none focus:ring-2 focus:ring-green-400"></textarea>
          </div>
          <button type="submit" className="mt-4 px-6 py-2 border border-green-400 text-green-300 hover:bg-green-500 hover:text-black transition duration-300">
            Send Message
          </button>
        </form>
      </div>
    </TransitionWrapper>
  );
}

