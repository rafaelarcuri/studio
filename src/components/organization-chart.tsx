
'use client';

import * as React from 'react';
import { getOrganizationTree, type OrganizationNode } from '@/data/organization';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { CheckCircle2, Phone, XCircle, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const UserCard = ({ user }: { user: OrganizationNode }) => {
    return (
        <Card className="min-w-72 hover:shadow-lg transition-shadow">
            <CardContent className="p-3 flex items-center gap-4">
                <div className="relative">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {user.status === 'ativo' ? (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-card" title="Online" />
                    ) : (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-gray-400 ring-2 ring-card" title="Offline" />
                    )}
                </div>
                <div className="flex-1">
                    <p className="font-bold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.position}</p>
                    {user.whatsAppNumber && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                           {user.whatsAppNumber.status === 'online' ? <CheckCircle2 className="h-3 w-3 text-green-500"/> : <XCircle className="h-3 w-3 text-red-500"/> }
                           <Phone className="h-3 w-3" />
                           <span className="truncate" title={user.whatsAppNumber.name}>{user.whatsAppNumber.name}</span>
                        </div>
                    )}
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    )
}

const TreeNode = ({ node }: { node: OrganizationNode }) => {
  const hasChildren = node.children && node.children.length > 0;
  return (
    <li className="relative">
      <div className="flex items-center">
        <UserCard user={node} />
      </div>
      {hasChildren && (
        <ul className="pl-12 pt-4 border-l-2 border-border ml-6 space-y-4">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
};


export default function OrganizationChart() {
    const [tree, setTree] = React.useState<OrganizationNode[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const data = await getOrganizationTree();
            setTree(data);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-16 w-1/3" />
                <div className="pl-12 space-y-4">
                    <Skeleton className="h-16 w-1/4" />
                    <Skeleton className="h-16 w-1/4" />
                </div>
            </div>
        );
    }

    if (!tree.length) {
        return <p className="p-4 text-center text-muted-foreground">Nenhuma estrutura organizacional encontrada.</p>;
    }

    return (
        <div className="p-4 bg-background rounded-lg overflow-x-auto">
            <ul className="space-y-4">
                {tree.map(rootNode => (
                    <TreeNode key={rootNode.id} node={rootNode} />
                ))}
            </ul>
        </div>
    );
}
