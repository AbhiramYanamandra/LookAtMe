export const Hero = () => {
    return (
      <div className="h-screen w-full py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-black mb-12">
            <img 
              src="/images/me.jpeg" 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-5xl font-bold text-center mb-4">
            Hey, I'm <span className="text-blue-700">Abhiram Yanamandra</span>.
          </h1>
          <p className="text-3xl text-center max-w-3xl">
            Here, you can check out what I'm working on. I'm trying to challenge myself
          </p>
        </div>
      </div>
    );
  };