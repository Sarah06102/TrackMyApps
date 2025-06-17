import NavBar from "../components/nav-bar"
import { Sidebar } from "../components/sidebar"
import { FaFileAlt, FaFolderOpen, FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateDoc } from "firebase/firestore";


export const storage = getStorage(app);

export const Profile = () => {
    const [userData, setUserData] = useState(null);
    const auth = getAuth();
    const user = auth.currentUser;
    const [resumeFile, setResumeFile] = useState(null);
    const [portfolioFile, setPortfolioFile] = useState(null);
    const [portfolioLink, setPortfolioLink] = useState('');
    const [showPortfolioModal, setShowPortfolioModal] = useState(false);
    const [linkedin, setLinkedIn] = useState('');
    const [github, setGitHub] = useState('');   

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
      
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData(data);
                if (data.resumeURL) {
                    setResumeFile({ name: data.resumeName || "Saved Resume", url: data.resumeURL });
                }
                if (data.portfolioLink) {
                    setPortfolioLink(data.portfolioLink);
                }
                if (data.portfolioName && data.portfolioLink) {
                    setPortfolioFile({ name: data.portfolioName, url: data.portfolioLink });
                }
                if (data.linkedin) {
                    setLinkedIn(data.linkedin);
                }
                if (data.github) {
                    setGitHub(data.github);
                }
                } else {
                    console.log("No user document found.");
                    setUserData({ name: "User", email: user.email });
                }
            } else {
                console.log("User not logged in");
          }
        });
      
        return () => unsubscribe();
    }, []);

    const handleResumeUpload = async (file) => {
        if (!user) return;
      
        const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
      
        await updateDoc(doc(db, "users", user.uid), {
          resumeURL: downloadURL,
          resumeName: file.name 
        });
      
        setResumeFile({ name: file.name, url: downloadURL });
    };

    const handleLinkSave = async () => {
        if (!user) return;
        if (!linkedin && !github && !portfolioLink) {
            alert("Please enter at least one link before saving.");
            return;
        }
      
        try {
          await updateDoc(doc(db, "users", user.uid), {
            linkedin,
            github,
            portfolioLink,
          });
          alert("Links saved successfully!");
        } catch (error) {
          console.error("Error saving links:", error);
          alert("Failed to save links.");
        }
      };
      

    const PortfolioModal = ({ onClose, onSave }) => {
        const [selectedOption, setSelectedOption] = useState(null); 
        const [tempFile, setTempFile] = useState(null);
        const [tempLink, setTempLink] = useState('');

        const handleSave = () => {
            if (selectedOption === 'upload' && !tempFile) return;
            if (selectedOption === 'link' && !tempLink.trim()) return;
          
            if (selectedOption === 'upload') {
              onSave({ file: tempFile });
            } else if (selectedOption === 'link') {
              onSave({ link: tempLink });
            }
            onClose();
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white p-6 rounded-lg w-96 space-y-4 shadow-lg">
                    <h2 className="text-lg font-semibold">Add Portfolio</h2>
                    <div className="flex gap-4">
                        <button
                            className={`flex-1 px-3 py-2 rounded-md ${selectedOption === 'upload' ? 'bg-sky-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => setSelectedOption('upload')}
                        >
                            Upload File
                        </button>
                        <button
                            className={`flex-1 px-3 py-2 rounded-md ${selectedOption === 'link' ? 'bg-sky-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => setSelectedOption('link')}
                        >
                            Add Link
                        </button>
                    </div>
                    {selectedOption === 'upload' && (
                        <input type="file" onChange={(e) => setTempFile(e.target.files[0])} />
                    )}
                    {selectedOption === 'link' && (
                        <input
                            type="url"
                            placeholder="https://yourportfolio.com"
                            className="w-full px-3 py-2 border rounded-md"
                            value={tempLink}
                            onChange={(e) => setTempLink(e.target.value)}
                        />
                    )}
                    <div className="flex justify-end gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-black">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-sky-600 text-white rounded-md">Save</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            <Sidebar />
            <>
                <div className="min-h-[500px] max-w-4xl w-full mx-auto p-10 mt-20 bg-white shadow-md rounded-md space-y-10">
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold mb-4">{userData ? `${userData.firstName} ${userData.lastName}` : "Unnamed User"}</h2>
                        <p className="text-gray-600">{userData?.email}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 text-center gap-x-1 gap-y-4">
                        {/* Resume Upload */}
                        <div>
                            <FaFileAlt className="mx-auto text-2xl text-sky-700 mb-2" />
                            <label htmlFor="cvUpload" className="cursor-pointer text-sky-700 font-semibold hover:underline">
                                Upload Resume/CV
                            </label>
                            <input type="file" id="cvUpload" className="hidden" onChange={(e) => { setResumeFile(e.target.files[0]); handleResumeUpload(e.target.files[0]);}} accept=".pdf" />
                            {resumeFile?.url && (
                                <p className="text-sm mt-1 text-green-600">
                                    <a href={resumeFile.url} target="_blank" rel="noopener noreferrer">
                                    {resumeFile.name || "View Resume"}
                                    </a>
                                </p>
                            )}
                        </div>

                        {/* Portfolio Upload/Link */}
                        <div>
                            <FaFolderOpen className="mx-auto text-2xl text-sky-700 mb-2" />
                            <button onClick={() => setShowPortfolioModal(true)} className="text-sky-700 font-semibold hover:underline">
                                Add Portfolio
                            </button>
                            {portfolioFile?.url && (
                                <p className="text-sm mt-1 text-blue-600">
                                    <a href={portfolioFile.url} target="_blank" rel="noopener noreferrer">
                                    {portfolioFile.name || "View Portfolio"}
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>

                        {/* Social Links */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                                <input
                                    value={linkedin}
                                    onChange={(e) => setLinkedIn(e.target.value)}
                                    type="url"
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
                                <input
                                    value={github}
                                    onChange={(e) => setGitHub(e.target.value)}
                                    type="url"
                                    placeholder="https://github.com/yourprofile"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                                />
                                <button onClick={handleLinkSave} className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 mx-auto block">
                                    Save Links
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Modal */}
                    {showPortfolioModal && (
                        <PortfolioModal
                            onClose={() => setShowPortfolioModal(false)}
                            onSave={async (data) => {
                            if (data.link) {
                                setPortfolioLink(data.link);
                                setPortfolioFile({ name: "Portfolio Link", url: data.link }); 
                                await updateDoc(doc(db, "users", user.uid), {
                                    portfolioLink: data.link,
                                    portfolioName: "Portfolio Link",
                                });
                            }
                            if (data.file) {
                                const storageRef = ref(storage, `portfolios/${user.uid}/${data.file.name}`);
                                await uploadBytes(storageRef, data.file);
                                const downloadURL = await getDownloadURL(storageRef);
                                await updateDoc(doc(db, "users", user.uid), {
                                    portfolioLink: downloadURL,
                                    portfolioName: data.file.name,
                                });
                              
                                setPortfolioFile({ name: data.file.name, url: downloadURL });
                            }
                        }}
                    />
                )}
            </>
        </div>
    );
};
