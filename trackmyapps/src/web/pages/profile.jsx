import NavBar from "../components/nav-bar"
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
    const [editingResume, setEditingResume] = useState(false);
    const [resumeLinkInput, setResumeLinkInput] = useState('');
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

    // Resume is stored as a link (e.g. Google Drive) rather than an uploaded file
    const handleResumeLinkSave = async () => {
        if (!user) return;
        const link = resumeLinkInput.trim();
        if (!/^https?:\/\//i.test(link)) {
            alert("Please enter a full link starting with https://");
            return;
        }
        try {
            await updateDoc(doc(db, "users", user.uid), {
                resumeURL: link,
                resumeName: "View Resume",
            });
            setResumeFile({ name: "View Resume", url: link });
            setEditingResume(false);
        } catch (error) {
            console.error("Error saving resume link:", error);
            alert("Failed to save resume link.");
        }
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
            <>
                <div className="min-h-[500px] max-w-4xl w-full mx-auto p-10 mt-20 bg-white shadow-md rounded-md space-y-10">
                    <div className="text-center space-y-2">
                        <h2 className="text-xl font-semibold mb-4">{userData ? `${userData.firstName} ${userData.lastName}` : "Unnamed User"}</h2>
                        <p className="text-gray-600">{userData?.email}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 text-center gap-8">
                        {/* Resume Upload */}
                        <div>
                            <FaFileAlt className="mx-auto text-2xl text-sky-700 mb-2" />
                            <button
                                onClick={() => { setResumeLinkInput(resumeFile?.url || ''); setEditingResume(!editingResume); }}
                                className="text-sky-700 font-semibold hover:underline"
                            >
                                {resumeFile?.url ? "Edit Resume Link" : "Add Resume Link"}
                            </button>
                            {editingResume && (
                                <div className="mt-2 flex gap-2 max-w-sm mx-auto">
                                    <input
                                        type="url"
                                        value={resumeLinkInput}
                                        onChange={(e) => setResumeLinkInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleResumeLinkSave()}
                                        placeholder="https://drive.google.com/..."
                                        className="flex-1 min-w-0 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                                        autoFocus
                                    />
                                    <button onClick={handleResumeLinkSave} className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-sm hover:bg-sky-700">
                                        Save
                                    </button>
                                </div>
                            )}
                            {!editingResume && resumeFile?.url && (
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
                            </div>
                        </div>
                        <button onClick={handleLinkSave} className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 mx-auto block">
                            Save Links
                        </button>
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
