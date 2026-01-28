import React, { useEffect, useState } from "react";
import { Sparkles, PlusCircle, CheckCircle2, Edit, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import MarketingCardModal from "./MarketingCardModal";
import ConfirmDialog from "./ConfirmDialog";
import { MarketingCard, MarketingEnquiry } from "@/types/marketing";
import API from "@/api/api";

const badgeColors: Record<string, string> = {
  trusted: "bg-[#0080ff] text-white border-[#0080ff]",
  verified: "bg-[#80ff00] text-black border-[#80ff00]",
  recommended: "bg-black text-white border-black",
};

const MarketingAdminPanel: React.FC = () => {
  const [cards, setCards] = useState<MarketingCard[]>([]);
  const [enquiries, setEnquiries] = useState<MarketingEnquiry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<MarketingCard | null>(null);
  const [deletingCard, setDeletingCard] = useState<MarketingCard | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cardsRes, enquiriesRes] = await Promise.all([
        API.get<MarketingCard[]>("/marketing/cards"),
        API.get<MarketingEnquiry[]>("/marketing/enquiries"),
      ]);
      setCards(cardsRes.data);
      setEnquiries(enquiriesRes.data);
    } catch (err) {
      console.error(err);
      toast.error("We couldn't load marketing data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (card: MarketingCard) => {
    setEditingCard(card);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingCard) return;
    try {
      await API.delete(`/marketing/cards/${deletingCard._id}`);
      setCards((prev) => prev.filter((c) => c._id !== deletingCard._id));
      toast.success("Marketing card deleted");
    } catch (err) {
      console.error(err);
      toast.error("We couldn't delete the card. Please try again.");
    } finally {
      setDeletingCard(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Marketing Cards</h2>
            <p className="text-sm text-gray-500">
              Manage spotlight cards and see enquiries from the buy flow
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <PlusCircle className="w-4 h-4" />
          Add Marketing Card
        </button>
      </div>

      <div className="px-6 py-5 space-y-6">
        {cards.length === 0 ? (
          <div className="text-sm text-gray-500">
            {loading ? "Loading cards..." : "No marketing cards yet. Add one to get started."}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card._id || card.id}
                className="border border-gray-100 rounded-lg overflow-hidden shadow-sm bg-gradient-to-b from-gray-50 to-white"
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={card.coverImage} alt={card.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-2">
                    <img
                      src={card.logo}
                      alt={card.name}
                      className="w-10 h-10 rounded-full border-2 border-white object-cover"
                    />
                    <div>
                      <p className="text-white text-sm font-semibold">{card.name}</p>
                      <p className="text-xs text-white/80">{card.title}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {card.originalPrice && card.originalPrice > card.price && (
                        <span className="text-sm text-gray-500 line-through">
                          Rs. {Number(card.originalPrice || 0).toLocaleString()}
                        </span>
                      )}
                      <span className="text-lg font-semibold text-gray-900">
                        Rs. {Number(card.price || 0).toLocaleString()}
                      </span>
                      {card.originalPrice && card.originalPrice > card.price && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          {Math.round(((card.originalPrice - card.price) / card.originalPrice) * 100)}% off
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(card)}
                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingCard(card)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {card.badges?.trusted && (
                      <span className={`px-2 py-1 text-xs rounded-full border ${badgeColors.trusted}`}>Trusted</span>
                    )}
                    {card.badges?.verified && (
                      <span className={`px-2 py-1 text-xs rounded-full border ${badgeColors.verified}`}>Verified</span>
                    )}
                    {card.badges?.recommended && (
                      <span className={`px-2 py-1 text-xs rounded-full border ${badgeColors.recommended}`}>
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-gray-900">Enquiries from Buy Now</h3>
          </div>
          {enquiries.length === 0 ? (
            <p className="text-sm text-gray-500">{loading ? "Loading enquiries..." : "No enquiries yet."}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Buyer</th>
                    <th className="px-3 py-2 text-left font-semibold">Contact</th>
                    <th className="px-3 py-2 text-left font-semibold">WhatsApp</th>
                    <th className="px-3 py-2 text-left font-semibold">Card</th>
                    <th className="px-3 py-2 text-left font-semibold">Qty</th>
                    <th className="px-3 py-2 text-left font-semibold">Total</th>
                    <th className="px-3 py-2 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enquiries.map((entry) => (
                    <tr key={entry._id || entry.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-900">{entry.buyerName}</td>
                      <td className="px-3 py-2 text-gray-600">
                        <div>{entry.email}</div>
                        <div className="text-xs text-gray-500">{entry.mobile}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {entry.whatsappNumber || "-"}
                      </td>
                      <td className="px-3 py-2 text-gray-700">
                        <div className="font-semibold text-gray-900">{entry.cardTitle}</div>
                        <div className="text-xs text-gray-500">{entry.cardName}</div>
                      </td>
                      <td className="px-3 py-2 text-gray-900">
                        {entry.quantity || 1}
                      </td>
                      <td className="px-3 py-2 text-gray-900">
                        Rs. {Number(entry.total || entry.cardPrice || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <MarketingCardModal
          onClose={() => {
            setShowModal(false);
            setEditingCard(null);
          }}
          onSaved={(card) => {
            if (editingCard) {
              setCards((prev) => prev.map((c) => (c._id === card._id ? card : c)));
            } else {
              setCards((prev) => [card, ...prev]);
            }
            setEditingCard(null);
            fetchData();
          }}
          card={editingCard}
        />
      )}

      {deletingCard && (
        <ConfirmDialog
          title="Delete Marketing Card"
          message={`Are you sure you want to delete "${deletingCard.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingCard(null)}
        />
      )}
    </div>
  );
};

export default MarketingAdminPanel;

