
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MoreVertical, Paperclip, Send, Smile, User, Phone, Video, MessageSquare, Check, CheckCheck, Mail, Tag, Edit, Filter, Slash, LogOut, UserPlus } from 'lucide-react';

import { mockChats, mockContacts, type Chat, type Contact, type Message } from '@/data/whatsapp';
import { type QuickReply, getQuickReplies } from '@/data/whatsapp-responses';
import { type User as AppUser, getUsers } from '@/data/users';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const tagColors: { [key: string]: string } = {
    novo: 'bg-blue-500 hover:bg-blue-600',
    'em andamento': 'bg-yellow-500 hover:bg-yellow-600',
    resolvido: 'bg-green-500 hover:bg-green-600',
};

const ChatListItem = ({ chat, contact, onSelect, isActive }: { chat: Chat; contact?: Contact; onSelect: () => void; isActive: boolean }) => (
    <div
        onClick={onSelect}
        className={cn(
            'flex items-start gap-4 p-3 cursor-pointer hover:bg-muted/50 border-b',
            isActive ? 'bg-muted' : ''
        )}
    >
        <Avatar className="h-12 w-12">
            <AvatarImage src={contact?.avatar} alt={contact?.name} />
            <AvatarFallback>{contact?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 overflow-hidden">
            <div className="flex justify-between items-center">
                <p className="font-semibold truncate">{contact?.name}</p>
                <p className="text-xs text-muted-foreground">{chat.lastMessageTime}</p>
            </div>
            <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                {chat.unreadCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                        {chat.unreadCount}
                    </Badge>
                )}
            </div>
            {chat.tags.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                    {chat.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className={cn("text-xs capitalize", tagColors[tag])}>{tag}</Badge>
                    ))}
                </div>
            )}
        </div>
    </div>
);

const MessageStatus = ({ status }: { status: Message['status'] }) => {
    if (status === 'read') {
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
    }
    if (status === 'delivered') {
        return <CheckCheck className="h-4 w-4 text-muted-foreground" />;
    }
    if (status === 'sent') {
        return <Check className="h-4 w-4 text-muted-foreground" />;
    }
    return null;
}

const ChatBubble = ({ message }: { message: Message }) => {
    const isMe = message.sender === 'me';
    return (
        <div className={cn('flex items-end gap-2 my-2', isMe ? 'justify-end' : 'justify-start')}>
            <div
                className={cn(
                    'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-3 py-2 shadow-sm',
                    isMe ? 'bg-sent-bubble text-sent-bubble-foreground rounded-br-none' : 'bg-card rounded-bl-none'
                )}
            >
                <p className="text-sm">{message.text}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                    <p className="text-xs opacity-70">{new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    {isMe && <MessageStatus status={message.status} />}
                </div>
            </div>
        </div>
    );
};

const ContactInfoPanel = ({ contact }: { contact: Contact }) => (
    <aside className="w-full md:w-1/3 lg:w-1/4 border-l flex-col hidden lg:flex">
        <header className="p-4 border-b flex items-center justify-center">
            <h3 className="font-semibold text-lg">Informações do Contato</h3>
        </header>
        <ScrollArea className="flex-1">
            <div className="p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mt-4">{contact.name}</h2>
                <p className="text-sm text-muted-foreground">{contact.isOnline ? 'Online' : 'Offline'}</p>
            </div>
            <Separator />
            <div className="p-6 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                </div>
                 <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                </div>
                <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground" /> Tags</h4>
                    <div className="flex flex-wrap gap-2">
                        {contact.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                         {contact.tags.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma tag.</p>}
                    </div>
                </div>
            </div>
             <Separator />
             <div className="p-6">
                 <Button className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar Contato
                 </Button>
             </div>
        </ScrollArea>
    </aside>
);


export default function WhatsAppChat() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [chats, setChats] = React.useState<Chat[]>(mockChats.sort((a,b) => new Date(b.messages[b.messages.length - 1].timestamp).getTime() - new Date(a.messages[a.messages.length - 1].timestamp).getTime()));
    const [contacts, setContacts] = React.useState<Contact[]>(mockContacts);
    const [users, setUsers] = React.useState<AppUser[]>([]);
    const [quickReplies, setQuickReplies] = React.useState<QuickReply[]>([]);
    
    const [selectedChatId, setSelectedChatId] = React.useState<string | null>(null);
    const [message, setMessage] = React.useState('');
    const [urlProcessed, setUrlProcessed] = React.useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false);
    const [filters, setFilters] = React.useState({ agent: 'all', status: 'all' });

    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    
    React.useEffect(() => {
        const fetchData = async () => {
            const [fetchedUsers, fetchedQuickReplies] = await Promise.all([
                getUsers(),
                getQuickReplies()
            ]);
            setUsers(fetchedUsers.filter(u => u.role === 'vendedor'));
            setQuickReplies(fetchedQuickReplies);
        };
        fetchData();
    }, []);

    const handleSelectChat = React.useCallback((contactId: string) => {
        setSelectedChatId(contactId);
        setChats(currentChats => currentChats.map(chat => 
            chat.contactId === contactId ? { ...chat, unreadCount: 0 } : chat
        ));
    }, []);

    React.useEffect(() => {
        if (urlProcessed || !chats.length) return;

        const contactIdFromUrl = searchParams.get('contactId');
        if (contactIdFromUrl) {
            if (chats.some(c => c.contactId === contactIdFromUrl)) {
                handleSelectChat(contactIdFromUrl);
                if (searchParams.has('contactId')) {
                    router.replace('/whatsapp', { scroll: false });
                }
            }
            setUrlProcessed(true);
        } else if (!selectedChatId) {
            setSelectedChatId(chats[0].contactId);
            setUrlProcessed(true);
        }
    }, [searchParams, chats, router, urlProcessed, handleSelectChat, selectedChatId]);


    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView();
    }, [selectedChatId]);


    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !selectedChatId) return;

        const newMessage: Message = { id: `msg-${Date.now()}`, text: message, timestamp: new Date().toISOString(), sender: 'me', status: 'sent' };
        
        setChats(currentChats => {
            const updated = currentChats.map(chat => {
                if (chat.contactId === selectedChatId) {
                    return {
                        ...chat,
                        messages: [...chat.messages, newMessage],
                        lastMessage: `Você: ${message}`,
                        lastMessageTime: new Date(newMessage.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    };
                }
                return chat;
            });
            return updated.sort((a, b) => new Date(b.messages[b.messages.length - 1].timestamp).getTime() - new Date(a.messages[a.messages.length - 1].timestamp).getTime());
        });
        setMessage('');
    };
    
    const handleEndChat = () => {
        if (!selectedChatId) return;
        setChats(currentChats => currentChats.map(chat =>
            chat.contactId === selectedChatId ? { ...chat, tags: ['resolvido'] } : chat
        ));
        toast({ title: 'Atendimento Encerrado', description: `A conversa com ${selectedContact?.name} foi marcada como resolvida.` });
    };

    const handleTransferChat = () => {
        if (!selectedChatId) return;
        // In a real app, you'd get the selected agent ID from the modal
        setIsTransferModalOpen(false);
        toast({ title: 'Atendimento Transferido', description: `A conversa foi transferida com sucesso.` });
    };

    const selectedChat = chats.find(c => c.contactId === selectedChatId);
    const selectedContact = contacts.find(c => c.id === selectedChatId);
    
    const filteredChats = React.useMemo(() => {
        return chats.filter(chat => {
            const statusMatch = filters.status === 'all' || chat.tags.includes(filters.status as any);
            const agentMatch = filters.agent === 'all' || chat.assigneeId === parseInt(filters.agent, 10);
            return statusMatch && agentMatch;
        });
    }, [chats, filters]);

    const getAgentName = (agentId: string) => {
        if (agentId === 'all') return 'Todos';
        const agent = users.find(u => u.id === parseInt(agentId, 10));
        return agent?.name || 'Desconhecido';
    }


    return (
        <div className="flex h-[calc(100vh-theme(spacing.40))] bg-card border rounded-lg overflow-hidden">
            <aside className="w-full md:w-1/3 lg:w-1/4 border-r flex flex-col">
                <header className="p-4 border-b shrink-0 space-y-3">
                     <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Pesquisar ou começar uma nova conversa" className="pl-10" />
                    </div>
                     <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between capitalize">
                                    <span>Atendente: {getAgentName(filters.agent)}</span>
                                    <Filter className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuItem onSelect={() => setFilters(f => ({ ...f, agent: 'all' }))}>Todos</DropdownMenuItem>
                                {users.map(user => (
                                    <DropdownMenuItem key={user.id} onSelect={() => setFilters(f => ({ ...f, agent: String(user.id) }))}>{user.name}</DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between capitalize">
                                    <span>Status: {filters.status}</span>
                                    <Filter className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuItem onSelect={() => setFilters(f => ({ ...f, status: 'all' }))}>Todos</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setFilters(f => ({ ...f, status: 'novo' }))}>Novo</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setFilters(f => ({ ...f, status: 'em andamento' }))}>Em Andamento</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setFilters(f => ({ ...f, status: 'resolvido' }))}>Resolvido</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <ScrollArea className="flex-1">
                    {filteredChats.length > 0 ? filteredChats.map(chat => {
                        const contact = contacts.find(c => c.id === chat.contactId);
                        return (
                            <ChatListItem
                                key={chat.contactId}
                                chat={chat}
                                contact={contact}
                                isActive={selectedChatId === chat.contactId}
                                onSelect={() => handleSelectChat(chat.contactId)}
                            />
                        )
                    }) : <p className="p-4 text-sm text-muted-foreground text-center">Nenhuma conversa encontrada.</p>}
                </ScrollArea>
            </aside>

            <main className="flex-1 flex flex-col">
                {selectedChat && selectedContact ? (
                    <>
                        <header className="flex items-center justify-between p-3 border-b shrink-0">
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={selectedContact.avatar} alt={selectedContact.name} />
                                    <AvatarFallback>{selectedContact.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{selectedContact.name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedContact.isOnline ? 'Online' : 'Offline'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" onClick={() => setIsTransferModalOpen(true)}><UserPlus className="mr-2 h-4 w-4" />Transferir</Button>
                                <Button variant="destructive" size="sm" onClick={handleEndChat}><LogOut className="mr-2 h-4 w-4" />Encerrar</Button>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                            </div>
                        </header>
                        <ScrollArea className="flex-1 p-4 bg-muted/20">
                           {selectedChat.messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
                           <div ref={messagesEndRef} />
                        </ScrollArea>
                        <footer className="p-3 bg-muted/30 border-t shrink-0">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" type="button"><Slash className="h-5 w-5" /></Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-96 mb-2">
                                        <div className="grid gap-4">
                                            <h4 className="font-medium leading-none">Respostas Rápidas</h4>
                                            <div className="grid gap-1 max-h-48 overflow-y-auto">
                                                {quickReplies.map(reply => (
                                                    <div
                                                        key={reply.id}
                                                        className="text-sm p-2 rounded-md hover:bg-muted cursor-pointer"
                                                        onClick={() => { setMessage(reply.message); }}
                                                    >
                                                        <p className="font-mono font-semibold">{reply.shortcut}</p>
                                                        <p className="text-muted-foreground truncate">{reply.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <Button variant="ghost" size="icon" type="button"><Paperclip /></Button>
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Digite uma mensagem"
                                    autoComplete="off"
                                />
                                <Button size="icon" type="submit" disabled={!message.trim()}>
                                    <Send />
                                </Button>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center">
                        <div>
                            <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground" />
                            <h2 className="mt-2 text-lg font-medium">Selecione uma conversa</h2>
                            <p className="text-muted-foreground">Escolha um contato na lista para começar a conversar.</p>
                        </div>
                    </div>
                )}
            </main>
            {selectedContact && <ContactInfoPanel contact={selectedContact} />}

            <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transferir Atendimento</DialogTitle>
                        <DialogDescription>
                            Selecione o novo atendente para esta conversa. O cliente não será notificado.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um atendente..." />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={String(user.id)}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span>{user.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsTransferModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleTransferChat}>Confirmar Transferência</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
